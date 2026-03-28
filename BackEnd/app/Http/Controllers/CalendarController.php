<?php

namespace App\Http\Controllers;

use App\Models\Seance;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * Export ICS des seances (coach ou client)
     */
    public function exportIcs(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('coach') && $user->coach) {
            $seances = Seance::query()
                ->where('coach_id', $user->coach->id)
                ->whereNull('deleted_at')
                ->orderBy('date')
                ->orderBy('heure_debut')
                ->get();
        } elseif ($user->hasRole('client') && $user->client) {
            $seances = $user->client->seances()
                ->whereNull('seances.deleted_at')
                ->orderBy('date')
                ->orderBy('heure_debut')
                ->get();
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Acces reserve aux coachs et clients.',
            ], 403);
        }

        $ical = $this->buildIcsCalendar($seances);
        $fileName = 'seances_' . now()->format('Ymd_His') . '.ics';

        return response($ical, 200, [
            'Content-Type' => 'text/calendar; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    /**
     * Synchronisation mock Google Calendar
     */
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'nullable|in:google,mock',
            'full_sync' => 'nullable|boolean',
        ]);

        $provider = $validated['provider'] ?? 'google';
        $fullSync = (bool) ($validated['full_sync'] ?? true);
        $user = $request->user();

        if ($user->hasRole('coach') && $user->coach) {
            $count = Seance::query()->where('coach_id', $user->coach->id)->count();
        } elseif ($user->hasRole('client') && $user->client) {
            $count = $user->client->seances()->count();
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Acces reserve aux coachs et clients.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Synchronisation calendrier executee (mode mock).',
            'data' => [
                'provider' => $provider,
                'full_sync' => $fullSync,
                'events_synced' => $count,
                'synced_at' => now()->toISOString(),
                'mode' => 'mock',
            ],
        ]);
    }

    /**
     * Construire un fichier iCalendar (ICS) minimal
     */
    private function buildIcsCalendar($seances): string
    {
        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ArchiWeb//Agenda//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
        ];

        foreach ($seances as $seance) {
            $start = Carbon::parse($seance->date->format('Y-m-d') . ' ' . substr((string) $seance->heure_debut, 0, 8), config('app.timezone'));
            $end = (clone $start)->addMinutes((int) $seance->duree);

            $lines[] = 'BEGIN:VEVENT';
            $lines[] = 'UID:seance-' . $seance->id . '@archiweb.local';
            $lines[] = 'DTSTAMP:' . now('UTC')->format('Ymd\\THis\\Z');
            $lines[] = 'DTSTART:' . $start->clone()->utc()->format('Ymd\\THis\\Z');
            $lines[] = 'DTEND:' . $end->clone()->utc()->format('Ymd\\THis\\Z');
            $lines[] = 'SUMMARY:' . $this->escapeIcsText($seance->titre);
            $lines[] = 'DESCRIPTION:' . $this->escapeIcsText((string) ($seance->notes ?? 'Seance ' . $seance->type));
            $lines[] = 'LOCATION:' . $this->escapeIcsText((string) ($seance->lieu ?? 'A definir'));
            $lines[] = 'STATUS:' . ($seance->statut === 'annulee' ? 'CANCELLED' : 'CONFIRMED');
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines) . "\r\n";
    }

    /**
     * Echappement minimal du texte ICS
     */
    private function escapeIcsText(string $text): string
    {
        return str_replace(
            ['\\', ';', ',', "\n", "\r"],
            ['\\\\', '\\;', '\\,', '\\n', ''],
            $text
        );
    }
}

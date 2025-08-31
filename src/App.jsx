import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Label } from './components/ui/label';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';
import { Play, Square, RotateCcw, Settings, Users, Clock } from 'lucide-react';

/** Helpers */
const minutesToMs = (m) => Math.max(0, Math.round(Number(m) || 0) * 60 * 1000);
const POSITIONS = ['Keeper', 'Verdediger', 'Middenveld', 'Aanvaller'];
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)] || null;

export default function App() {
  /** Team/instellen */
  const [teamName, setTeamName] = useState('JO11-1');
  const [players, setPlayers] = useState([]); // {id,name,position,swaps:number}
  const [newName, setNewName] = useState('');
  const [newPos, setNewPos] = useState('Middenveld');
  const [swapEveryMin, setSwapEveryMin] = useState(7);

  /** Timer */
  const [running, setRunning] = useState(false);
  const [nextAt, setNextAt] = useState(null); // timestamp (ms)
  const timeoutRef = useRef(null);
  const [tick, setTick] = useState(0);

  /** Audio alarm */
  const audioRef = useRef(null);
  useEffect(() => {
    const a = new Audio(
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAExhdmYANAAAAAAA'
    );
    a.volume = 1.0;
    audioRef.current = a;
  }, []);

  // kleine ticker voor countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  function clearTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  /** Suggestie (wie wisselen) */
  const [suggestId, setSuggestId] = useState(null);

  function pickNextPlayerId(list) {
    if (!list || list.length === 0) return null;
    const minSwaps = Math.min(...list.map((p) => p.swaps ?? 0));
    const candidates = list.filter((p) => (p.swaps ?? 0) === minSwaps);
    return sample(candidates)?.id || null;
  }

  function playAlarm() {
    try {
      audioRef.current?.play();
    } catch {}
    if (navigator.vibrate) {
      try {
        navigator.vibrate([200, 120, 200]);
      } catch {}
    }
  }

  function scheduleNext(targetTs) {
    clearTimer();
    const delay = Math.max(0, targetTs - Date.now());
    timeoutRef.current = setTimeout(() => {
      playAlarm();
      const id = pickNextPlayerId(players);
      setSuggestId(id);
      const name = players.find((p) => p.id === id)?.name;
      toast(name ? `Tijd om te wisselen: ${name}` : `Tijd om te wisselen!`);
      const nxt = Date.now() + minutesToMs(swapEveryMin);
      setNextAt(nxt);
      scheduleNext(nxt);
    }, delay);
  }

  function handleStart() {
    const first = Date.now() + minutesToMs(swapEveryMin);
    setRunning(true);
    setNextAt(first);
    setSuggestId(pickNextPlayerId(players));
    scheduleNext(first);
  }

  function handleStop() {
    setRunning(false);
    setNextAt(null);
    setSuggestId(null);
    clearTimer();
  }

  function handleReset() {
    handleStop();
    toast.success('GerESet');
  }

  function fmtCountdown() {
    if (!running || !nextAt) return '—';
    const ms = Math.max(0, nextAt - Date.now());
    const s = Math.floor(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  /** Team-acties */
  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    setPlayers((p) => [
      ...p,
      { id: crypto.randomUUID(), name, position: newPos, swaps: 0 },
    ]);
    setNewName('');
  }
  function setPos(id, pos) {
    setPlayers((p) =>
      p.map((x) => (x.id === id ? { ...x, position: pos } : x))
    );
  }
  function removePlayer(id) {
    setPlayers((p) => p.filter((x) => x.id !== id));
    if (suggestId === id) setSuggestId(null);
  }

  /** ➕/➖ wissels */
  function addSwap(id, delta = 1) {
    setPlayers((p) =>
      p.map((x) =>
        x.id === id ? { ...x, swaps: Math.max(0, (x.swaps ?? 0) + delta) } : x
      )
    );
  }

  function confirmSuggestedSwap() {
    if (!suggestId) return;
    const updated = players.map((x) =>
      x.id === suggestId ? { ...x, swaps: (x.swaps ?? 0) + 1 } : x
    );
    setPlayers(updated);
    setSuggestId(pickNextPlayerId(updated));
  }

  const playersSorted = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name)),
    [players]
  );
  const suggestedName = players.find((p) => p.id === suggestId)?.name || '—';

  const posClass = (pos) =>
    `badge ${
      pos === 'Keeper'
        ? 'pos-keeper'
        : pos === 'Verdediger'
        ? 'pos-verdediger'
        : pos === 'Middenveld'
        ? 'pos-middenveld'
        : 'pos-aanvaller'
    }`;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* witte achtergrond */}
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              ⚽️ Coach Assistent
            </h1>
            <p className="text-sm text-muted-foreground">
              Wissels & teamoverzichten — met geluid, suggesties en +/−
              correctie.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </header>

        <Tabs defaultValue="setup" className="mt-6">
          {/* TabsList met tabbar-klass voor groene actieve tab */}
          <TabsList className="tabbar">
            <TabsTrigger value="setup">Instellen</TabsTrigger>
            <TabsTrigger value="match">Wedstrijd</TabsTrigger>
            <TabsTrigger value="roles">Overzichten</TabsTrigger>
          </TabsList>

          {/* INSTELLEN */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>
                  Voeg spelers toe en kies posities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <Label>Teamnaam</Label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Spelernaam</Label>
                    <Input
                      placeholder="Bijv. Sam"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                    />
                  </div>
                  <div>
                    <Label>Positie</Label>
                    <select
                      value={newPos}
                      onChange={(e) => setNewPos(e.target.value)}
                      className="w-full border rounded px-2 py-2"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="primary" onClick={addPlayer}>
                    Toevoegen
                  </Button>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-3">
                  {playersSorted.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nog geen spelers toegevoegd.
                    </p>
                  )}
                  {playersSorted.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="flex items-center justify-between py-3 gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={posClass(p.position)}>
                            {p.position}
                          </Badge>
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {p.swaps ?? 0}x gewisseld
                          </span>
                          {/* ronde +/− knoppen in je groene stijl (secondary-variant) */}
                          <Button
                            variant="secondary"
                            onClick={() => addSwap(p.id, -1)}
                            className="btn-round"
                          >
                            −
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => addSwap(p.id, 1)}
                            className="btn-round"
                          >
                            +
                          </Button>
                          <select
                            value={p.position}
                            onChange={(e) => setPos(p.id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            {POSITIONS.map((x) => (
                              <option key={x} value={x}>
                                {x}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="secondary"
                            onClick={() => removePlayer(p.id)}
                          >
                            Verwijder
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WEDSTRIJD */}
          <TabsContent value="match" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{teamName} – Wedstrijd</CardTitle>
                <CardDescription>
                  Start/Stop, geluid-alarm & wissel-suggestie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-4 text-center">
                    <div className="text-xs uppercase text-muted-foreground">
                      Status
                    </div>
                    <div className="text-2xl font-semibold">
                      {running ? 'Bezig' : 'Gestopt'}
                    </div>
                  </div>
                  <div className="rounded-xl border p-4 text-center">
                    <div className="text-xs uppercase text-muted-foreground">
                      Volgende wissel over
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                      {fmtCountdown()}
                    </div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <Label>Wissel-interval (min)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={swapEveryMin}
                      onChange={(e) =>
                        setSwapEveryMin(
                          Math.max(1, Number(e.target.value || 1))
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!running ? (
                    <Button
                      variant="primary"
                      onClick={handleStart}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" /> Start
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleStop}
                      className="gap-2"
                    >
                      <Square className="w-4 h-4" /> Stop
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      playAlarm();
                      const id = pickNextPlayerId(players);
                      setSuggestId(id);
                      const nm = players.find((p) => p.id === id)?.name;
                      toast(nm ? `Test: wissel ${nm}` : `Test alarm`);
                    }}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" /> Test alarm
                  </Button>
                </div>

                {/* Suggestie + overzicht wissels */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Suggestie (minst gewisseld):
                      </span>
                      <span className="text-base font-semibold">
                        {suggestedName}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={confirmSuggestedSwap}
                        disabled={!suggestId}
                      >
                        Bevestig wissel
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Wissel-overzicht
                      </div>
                      {playersSorted.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Geen spelers.
                        </p>
                      ) : (
                        <ul className="grid md:grid-cols-2 gap-2">
                          {playersSorted.map((p) => (
                            <li key={p.id} className="list-row">
                              <div className="flex items-center gap-2">
                                <Badge className={posClass(p.position)}>
                                  {p.position}
                                </Badge>
                                <span>{p.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {p.swaps ?? 0}x gewisseld
                                </span>
                                <Button
                                  variant="secondary"
                                  onClick={() => addSwap(p.id, -1)}
                                  className="btn-round"
                                >
                                  −
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => addSwap(p.id, 1)}
                                  className="btn-round"
                                >
                                  +
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OVERZICHTEN */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Overzichten</CardTitle>
                <CardDescription>
                  Rijden, wastas & fluiten (eenvoudige versie)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Voeg hier later je schema’s toe. De basis werkt: geluid-alarm,
                  suggesties en teller (+/−) per speler.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Tip: zet op je beginscherm voor PWA-gevoel (werkt ook offline).
        </footer>
      </div>
    </div>
  );
}

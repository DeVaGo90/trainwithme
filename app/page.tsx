"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  User,
  Users,
  Search,
  LogOut,
  Check,
  X,
  Dumbbell,
  Bike,
  Waves,
  PersonStanding,
  Trophy,
  HeartHandshake,
  ShieldCheck,
  Play,
  Square,
  Activity,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const sports = [
  "Laufen",
  "Gym",
  "Radfahren",
  "Fußball",
  "Tennis",
  "Yoga",
  "Wandern",
  "Schwimmen",
  "Trailrunning",
  "Hyrox",
];

type TabKey = "live" | "friends" | "profile";
type FriendshipStatus = "pending" | "accepted" | "rejected";
type SessionStatus = "live" | "ended";

type AppUser = {
  id: string;
  email: string;
};

type Profile = {
  user_id: string;
  email: string;
  display_name: string | null;
};

type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
};

type SessionItem = {
  id: string;
  user_id: string;
  user_name: string | null;
  sport: string | null;
  location: string | null;
  status: SessionStatus | null;
  created_at: string | null;
  ended_at?: string | null;
};

function sportIcon(label: string) {
  const props = { size: 16, strokeWidth: 2.2 };
  switch (label) {
    case "Laufen":
    case "Wandern":
    case "Trailrunning":
      return <PersonStanding {...props} />;
    case "Gym":
    case "Hyrox":
      return <Dumbbell {...props} />;
    case "Radfahren":
      return <Bike {...props} />;
    case "Schwimmen":
      return <Waves {...props} />;
    case "Fußball":
    case "Tennis":
      return <Trophy {...props} />;
    default:
      return <Activity {...props} />;
  }
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 pb-24 text-slate-900">
      <div className="mx-auto max-w-md px-3 pt-3">{children}</div>
    </main>
  );
}

function AppCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

function GreenButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

function RedButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none placeholder:text-slate-400 ${props.className || ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none disabled:bg-slate-100 disabled:text-slate-500 ${props.className || ""}`}
    />
  );
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function formatDuration(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return "-";
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  if (Number.isNaN(startDate) || Number.isNaN(endDate) || endDate <= startDate) return "-";

  const diffMs = endDate - startDate;
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} Min`;
  return `${hours}h ${minutes} Min`;
}

function getCurrentLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        resolve(`${lat}, ${lng}`);
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("live");
  const [user, setUser] = useState<AppUser | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [sport, setSport] = useState("Laufen");
  const [userSearch, setUserSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user;
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || "",
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;

      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || "",
        });
      } else {
        setUser(null);
        setProfile(null);
        setAllProfiles([]);
        setFriendships([]);
        setSessions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    void loadLiveSessions();
  }, []);

  useEffect(() => {
    if (!user) return;
    void initializeUserData();
  }, [user]);

  const incomingRequests = useMemo(() => {
    if (!user) return [] as Friendship[];
    return friendships.filter(
      (f) => f.addressee_id === user.id && f.status === "pending"
    );
  }, [friendships, user]);

  const friendIds = useMemo(() => {
    if (!user) return [] as string[];
    return friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id));
  }, [friendships, user]);

  const friendProfiles = useMemo(() => {
    return allProfiles.filter((p) => friendIds.includes(p.user_id));
  }, [allProfiles, friendIds]);

  const discoverableProfiles = useMemo(() => {
    if (!user) return [] as Profile[];

    return allProfiles.filter((p) => {
      if (p.user_id === user.id) return false;

      const alreadyRelated = friendships.some(
        (f) =>
          (f.requester_id === user.id && f.addressee_id === p.user_id) ||
          (f.addressee_id === user.id && f.requester_id === p.user_id)
      );

      if (alreadyRelated) return false;

      const text = `${p.display_name || ""} ${p.email}`.toLowerCase();
      return text.includes(userSearch.toLowerCase());
    });
  }, [allProfiles, friendships, user, userSearch]);

  const liveSessions = useMemo(() => {
    if (!user) return [] as SessionItem[];
    return sessions.filter((s) => {
      const isOwn = s.user_id === user.id;
      const isFriend = friendIds.includes(s.user_id);
      return s.status === "live" && (isOwn || isFriend);
    });
  }, [sessions, user, friendIds]);

  const myLiveSession = useMemo(() => {
    if (!user) return null;
    return liveSessions.find((s) => s.user_id === user.id) || null;
  }, [liveSessions, user]);

  const sessionHistory = useMemo(() => {
    if (!user) return [] as SessionItem[];
    return sessions
      .filter((s) => s.user_id === user.id && s.status === "ended")
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [sessions, user]);

  async function initializeUserData() {
    await ensureProfile();
    await Promise.all([
      loadProfile(),
      loadAllProfiles(),
      loadFriendships(),
      loadAllSessions(),
    ]);
  }

  async function ensureProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      await supabase.from("profiles").insert({
        user_id: user.id,
        email: user.email,
        display_name: user.email.split("@")[0],
      });
    }
  }

  async function loadProfile() {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
    }
  }

  async function loadAllProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .order("display_name", { ascending: true });

    setAllProfiles(data || []);
  }

  async function loadFriendships() {
    if (!user) return;

    const { data } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    setFriendships((data || []) as Friendship[]);
  }

  async function loadLiveSessions() {
    const { data } = await supabase
      .from("sessions")
      .select("id, user_id, user_name, sport, location, status, created_at, ended_at")
      .eq("status", "live")
      .order("created_at", { ascending: false });

    setSessions(data || []);
  }

  async function loadAllSessions() {
    const { data } = await supabase
      .from("sessions")
      .select("id, user_id, user_name, sport, location, status, created_at, ended_at")
      .order("created_at", { ascending: false });

    setSessions(data || []);
  }

  async function signUp() {
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("Registrierung fehlgeschlagen: " + error.message);
      return;
    }

    setMessage("Registrierung gestartet. Bestätige ggf. deine E-Mail.");
  }

  async function signIn() {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("Login fehlgeschlagen: " + error.message);
      return;
    }

    setMessage("Login erfolgreich.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMessage("Abgemeldet.");
  }

  async function saveProfile() {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);

    if (error) {
      setMessage("Profil konnte nicht gespeichert werden: " + error.message);
      return;
    }

    setMessage("Profil gespeichert.");
    await Promise.all([loadProfile(), loadAllProfiles(), loadAllSessions()]);
  }

  async function sendFriendRequest(targetUserId: string) {
    if (!user) return;

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: targetUserId,
      status: "pending",
    });

    if (error) {
      setMessage("Anfrage konnte nicht gesendet werden: " + error.message);
      return;
    }

    setMessage("Freundschaftsanfrage gesendet.");
    await loadFriendships();
  }

  async function acceptFriend(id: string) {
    if (!user) return;

    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", id)
      .eq("addressee_id", user.id);

    if (error) {
      setMessage("Anfrage konnte nicht angenommen werden: " + error.message);
      return;
    }

    setMessage("Freund hinzugefügt.");
    await Promise.all([loadFriendships(), loadAllProfiles(), loadAllSessions()]);
  }

  async function rejectFriend(id: string) {
    if (!user) return;

    const { error } = await supabase
      .from("friendships")
      .update({ status: "rejected" })
      .eq("id", id)
      .eq("addressee_id", user.id);

    if (error) {
      setMessage("Anfrage abgelehnt.");
      await loadFriendships();
      return;
    }

    setMessage("Anfrage abgelehnt.");
    await loadFriendships();
  }

  async function startSession() {
    if (!user) {
      setMessage("Bitte zuerst einloggen.");
      return;
    }

    if (!profile?.display_name) {
      setMessage("Bitte zuerst einen Anzeigenamen speichern.");
      return;
    }

    if (!sport) {
      setMessage("Bitte eine Sportart wählen.");
      return;
    }

    if (myLiveSession) {
      setMessage("Du hast bereits eine aktive Session.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Standort wird ermittelt...");

    const currentLocation = await getCurrentLocation();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        user_name: profile.display_name,
        sport,
        location: currentLocation,
        status: "live",
      })
      .select()
      .single();

    if (error) {
      setMessage("Session konnte nicht gestartet werden: " + error.message);
      setIsSubmitting(false);
      return;
    }

    if (!currentLocation) {
      setMessage("Training gestartet (kein Standort verfügbar).");
    } else {
      setMessage("Training gestartet.");
    }

    setSessions((prev) => [data as SessionItem, ...prev.filter((s) => s.id !== data.id)]);
    setIsSubmitting(false);
  }

  async function endSession(sessionId: string) {
    if (!user) return;

    setIsSubmitting(true);

    const endedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("sessions")
      .update({
        status: "ended",
        ended_at: endedAt,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      setMessage("Session konnte nicht beendet werden: " + error.message);
      setIsSubmitting(false);
      return;
    }

    if (!data || data.length === 0) {
      setMessage("Session wurde nicht gefunden oder durfte nicht geändert werden.");
      setIsSubmitting(false);
      return;
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: "ended", ended_at: endedAt }
          : s
      )
    );

    setMessage("Training beendet.");
    setIsSubmitting(false);
  }

  if (!user) {
    return (
      <MobileShell>
        <AppCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TrainWithMe</h1>
              <p className="text-sm text-slate-500">
                Sieh, wer gerade welchen Sport macht
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
            />
            <PrimaryButton onClick={signIn}>Einloggen</PrimaryButton>
            <GreenButton onClick={signUp}>Registrieren</GreenButton>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </AppCard>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <AppCard className="mb-4 overflow-hidden border-none bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-700 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              TrainWithMe
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Live Training</h1>
            <p className="mt-2 text-sm text-white/80">Eingeloggt als {user.email}</p>
          </div>

          <button
            onClick={signOut}
            className="rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur"
          >
            <LogOut size={16} />
          </button>
        </div>

        <p className="mt-4 text-sm text-white/70">
          Sieh in Echtzeit, wer gerade trainiert.
        </p>
      </AppCard>

      {message && (
        <AppCard className="mb-4 bg-indigo-50 text-sm text-slate-700">
          {message}
        </AppCard>
      )}

      {activeTab === "profile" && (
        <AppCard>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Profil</h2>
              <p className="text-sm text-slate-500">
                Deinen Anzeigenamen anpassen
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Anzeigename"
            />
            <PrimaryButton onClick={saveProfile}>Profil speichern</PrimaryButton>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">Name:</span>{" "}
              {profile?.display_name || "-"}
            </div>
            <div className="mt-1">
              <span className="font-semibold text-slate-900">E-Mail:</span>{" "}
              {user.email}
            </div>
          </div>
        </AppCard>
      )}

      {activeTab === "friends" && (
        <div className="grid gap-4">
          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <Search size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Personen finden</h2>
                <p className="text-sm text-slate-500">
                  Neue Freunde direkt in der App
                </p>
              </div>
            </div>

            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Suche nach Name oder E-Mail"
              className="mb-3"
            />

            <div className="grid gap-3">
              {discoverableProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Keine passenden Nutzer gefunden.
                </div>
              ) : (
                discoverableProfiles.map((p) => (
                  <div key={p.user_id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{p.display_name || p.email}</div>
                    <div className="mt-1 text-sm text-slate-500">{p.email}</div>
                    <PrimaryButton
                      onClick={() => sendFriendRequest(p.user_id)}
                      className="mt-3 w-full"
                    >
                      Hinzufügen
                    </PrimaryButton>
                  </div>
                ))
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Freunde</h2>
                <p className="text-sm text-slate-500">Deine bestätigten Kontakte</p>
              </div>
            </div>

            <div className="grid gap-3">
              {friendProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Noch keine Freunde.
                </div>
              ) : (
                friendProfiles.map((friend) => (
                  <div key={friend.user_id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{friend.display_name || friend.email}</div>
                    <div className="mt-1 text-sm text-slate-500">{friend.email}</div>
                  </div>
                ))
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <HeartHandshake size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Anfragen</h2>
                <p className="text-sm text-slate-500">
                  Offene Freundschaftsanfragen
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {incomingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Keine offenen Anfragen.
                </div>
              ) : (
                incomingRequests.map((request) => {
                  const sender = allProfiles.find((p) => p.user_id === request.requester_id);

                  return (
                    <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="font-semibold">
                        {sender?.display_name || sender?.email || "Unbekannt"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        möchte dich hinzufügen
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <GreenButton onClick={() => acceptFriend(request.id)}>
                          <Check size={16} /> Annehmen
                        </GreenButton>
                        <GhostButton onClick={() => rejectFriend(request.id)}>
                          <X size={16} /> Ablehnen
                        </GhostButton>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AppCard>
        </div>
      )}

      {activeTab === "live" && (
        <div className="grid gap-4">
          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                {myLiveSession ? <Square size={18} /> : <Play size={18} />}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {myLiveSession ? "Training läuft" : "Training starten"}
                </h2>
                <p className="text-sm text-slate-500">
                  {myLiveSession
                    ? "Beende deine aktuelle Session"
                    : "Einfach live gehen und Sportart wählen"}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <Select
                value={myLiveSession?.sport || sport}
                onChange={(e) => setSport(e.target.value)}
                disabled={!!myLiveSession || isSubmitting}
              >
                {sports.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>

              {myLiveSession?.location && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Ort:</span>{" "}
                  {myLiveSession.location}
                </div>
              )}

              {myLiveSession ? (
                <RedButton
                  onClick={() => endSession(myLiveSession.id)}
                  disabled={isSubmitting}
                >
                  <Square size={16} />
                  {isSubmitting ? "Wird beendet..." : "Training beenden"}
                </RedButton>
              ) : (
                <GreenButton onClick={startSession} disabled={isSubmitting}>
                  <Play size={16} />
                  {isSubmitting ? "Wird gestartet..." : "Ich trainiere jetzt"}
                </GreenButton>
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Live bei Freunden</h2>
                <p className="text-sm text-slate-500">
                  Wer gerade trainiert
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {liveSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Gerade ist niemand live.
                </div>
              ) : (
                liveSessions.map((s) => {
                  const isOwn = s.user_id === user.id;

                  return (
                    <div key={s.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 text-sm font-semibold text-slate-900">
                            {isOwn ? "Du" : s.user_name || "Unbekannt"}
                          </div>
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <span className="rounded-full bg-slate-100 p-2">
                              {sportIcon(s.sport || "")}
                            </span>
                            <span>{s.sport || "-"}</span>
                          </div>
                          {s.location && (
                            <div className="mt-2 text-sm text-slate-600">
                              Ort: {s.location}
                            </div>
                          )}
                          <div className="mt-2 text-sm text-slate-500">
                            Seit: {formatDateTime(s.created_at)}
                          </div>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Live
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Deine History</h2>
                <p className="text-sm text-slate-500">
                  Vergangene Trainings-Sessions
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {sessionHistory.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Noch keine beendeten Sessions.
                </div>
              ) : (
                sessionHistory.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <span className="rounded-full bg-slate-100 p-2">
                        {sportIcon(s.sport || "")}
                      </span>
                      <span>{s.sport || "-"}</span>
                    </div>

                    {s.location && (
                      <div className="mt-2 text-sm text-slate-600">
                        Ort: {s.location}
                      </div>
                    )}

                    <div className="mt-2 text-sm text-slate-500">
                      Start: {formatDateTime(s.created_at)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Ende: {formatDateTime(s.ended_at)}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      Dauer: {formatDuration(s.created_at, s.ended_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </AppCard>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab("live")}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
              activeTab === "live" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            <Activity size={16} className="mx-auto mb-1" />
            Live
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
              activeTab === "friends" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            <Users size={16} className="mx-auto mb-1" />
            Freunde
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ${
              activeTab === "profile" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            <User size={16} className="mx-auto mb-1" />
            Profil
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
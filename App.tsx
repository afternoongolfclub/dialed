import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './lib/firebase.ts';
import { useAuth } from './contexts/AuthContext.tsx';
import { Auth } from './components/Auth.tsx';
import { Layout } from './components/Layout.tsx';
import { Matrix } from './components/Matrix.tsx';
import { TheBag } from './components/TheBag.tsx';
import { Combine } from './components/Combine.tsx';
import { AppView, Wedge, WedgeInput, CombineSession } from './types.ts';
import { Profile } from './components/Profile.tsx';

export default function App() {
  const { user, firebaseUser, isLoading } = useAuth();
  const [wedges, setWedges] = useState<Wedge[]>([]);
  const [view, setView] = useState<AppView>('matrix');
  const [combineWedge, setCombineWedge] = useState<Wedge | null>(null);

  // ── Real-time wedge listener ───────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseUser) {
      setWedges([]);
      return;
    }
    const q = query(
      collection(db, 'wedges'),
      where('userId', '==', firebaseUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          club: data.club,
          loft: data.loft,
          fullSwing: data.fullSwing ?? 0,
          threeQuarter: data.threeQuarter ?? 0,
          half: data.half ?? 0,
          quarter: data.quarter ?? 0,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
        } as Wedge;
      });
      setWedges(docs);
    });
    return unsub;
  }, [firebaseUser]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addWedge = useCallback(async (input: WedgeInput) => {
    if (!firebaseUser) throw new Error('Not signed in');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Save timed out — check your connection and try again')), 10_000)
    );
    await Promise.race([
      addDoc(collection(db, 'wedges'), {
        ...input,
        userId: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      timeout,
    ]);
  }, [firebaseUser]);

  const deleteWedge = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'wedges', id));
  }, []);

  const updateWedgeDistances = useCallback(async (
    id: string,
    distances: Partial<Pick<Wedge, 'fullSwing' | 'threeQuarter' | 'half' | 'quarter'>>
  ) => {
    await updateDoc(doc(db, 'wedges', id), {
      ...distances,
      updatedAt: serverTimestamp(),
    });
  }, []);

  // ── Combine completion ─────────────────────────────────────────────────────
  const handleCombineComplete = useCallback(async (session: CombineSession) => {
    const { wedgeId, averages } = session;
    const updates: Partial<Pick<Wedge, 'fullSwing' | 'threeQuarter' | 'half' | 'quarter'>> = {};
    if (averages.fullSwing)    updates.fullSwing    = averages.fullSwing;
    if (averages.threeQuarter) updates.threeQuarter = averages.threeQuarter;
    if (averages.half)         updates.half         = averages.half;
    if (averages.quarter)      updates.quarter      = averages.quarter;
    await updateWedgeDistances(wedgeId, updates);
    setCombineWedge(null);
    setView('matrix');
  }, [updateWedgeDistances]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="flex flex-col items-center gap-3">
          <img src="/icon.svg" alt="" className="w-12 h-12 animate-pulse" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // ── Combine active ─────────────────────────────────────────────────────────
  if (view === 'combine' && combineWedge) {
    return (
      <Layout view={view} onChangeView={setView} hideNav={true}>
        <Combine
          wedge={combineWedge}
          onComplete={handleCombineComplete}
          onBack={() => { setCombineWedge(null); setView('bag'); }}
        />
      </Layout>
    );
  }

  // ── Main app ───────────────────────────────────────────────────────────────
  return (
    <Layout view={view} onChangeView={setView}>
      {view === 'matrix' && (
        <Matrix wedges={wedges} onGoToBag={() => setView('bag')} />
      )}
      {view === 'bag' && (
        <TheBag
          wedges={wedges}
          onAdd={addWedge}
          onDelete={deleteWedge}
          onStartCombine={(wedge) => {
            setCombineWedge(wedge);
            setView('combine');
          }}
        />
      )}
      {view === 'profile' && <Profile />}
      {view === 'combine' && !combineWedge && (
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Combine</h2>
          <p className="text-sm text-gray-500 mb-6">
            Select a wedge from The Bag to start a combine session, or tap "Combine" next to any club.
          </p>
          <TheBag
            wedges={wedges}
            onAdd={addWedge}
            onDelete={deleteWedge}
            onStartCombine={(wedge) => {
              setCombineWedge(wedge);
            }}
          />
        </div>
      )}
    </Layout>
  );
}

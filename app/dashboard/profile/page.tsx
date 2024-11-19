"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ShiftCalendar } from '@/components/shifts/shift-calendar';

const DashboardPage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch shifts or other user-specific data here if needed
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="not-authenticated">
        <p>You must be logged in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user.email}</h1>
        <button onClick={signOut}>Sign Out</button>
      </header>
      <main>
        <ShiftCalendar shifts={shifts} />
      </main>
    </div>
  );
};

export default DashboardPage;
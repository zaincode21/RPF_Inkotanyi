import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { LeaderDashboard } from "./components/LeaderDashboard";
import { MemberDashboard } from "./components/MemberDashboard";
import { MemberManagement } from "./components/MemberManagement";
import { EventManagement } from "./components/EventManagement";
import { AttendancePage } from "./components/AttendancePage";
import { ProfilePage } from "./components/ProfilePage";
import { AchievementsPage } from "./components/AchievementsPage";
import { NewsPage } from "./components/NewsPage";
import { NewsDetail } from "./components/NewsDetail";
import { ResourcesPage } from "./components/ResourcesPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { TwoFactorPage } from "./components/TwoFactorPage";
import { LandingPage } from "./components/LandingPage";
import { api } from "./lib/api";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [twoFactorEmail, setTwoFactorEmail] = useState(null);
  const { token, user, login, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [news, setNews] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync currentUser with auth user and handle post-login navigation
  useEffect(() => {
    if (user) {
      setCurrentUser(apiUserToLocal(user));
      
      // Check if we need to navigate to a specific page after login
      const postLoginPage = localStorage.getItem('postLoginPage');
      if (postLoginPage) {
        localStorage.removeItem('postLoginPage');
        setCurrentPage(postLoginPage);
      }
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  // Fetch events (public) on load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ev = await api.events();
        setEvents((ev.data || []).map(apiEventToLocal));
      } catch (e) { /* backend may not be ready yet */ }
      setLoading(false);
    };
    load();
  }, []);

  // Fetch user-scoped data when token changes
  useEffect(() => {
    const loadAuthed = async () => {
      if (!token || !user) return;
      setLoading(true);
      try {
        const eventsRes = await api.events();
        const attendanceRes = (user.role === 'Leader') 
          ? await api.allAttendance(token).catch(() => ({ data: [] }))
          : await api.attendanceByUser(token, user.id).catch(() => ({ data: [] }));
        
        const [approvedRes, pendingRes] = await Promise.all([
          api.approvedUsers(token).catch(() => ({ data: [] })),
          api.pendingUsers(token).catch(() => ({ data: [] })),
        ]);
        
        const attendanceLocal = (attendanceRes.data || []).map(apiAttendanceToLocal);
        setAttendance(attendanceLocal);

        const mergedEvents = mergeRsvps(
          (eventsRes.data || []).map(apiEventToLocal),
          attendanceLocal,
        );
        setEvents(mergedEvents);

        const mergedUsers = [
          ...(approvedRes.data || []),
          ...(pendingRes.data || []),
        ].map(apiUserToLocal);
        setUsers(mergedUsers);

        const [achRes, newsRes, resRes] = await Promise.all([
          api.achievements(),
          api.news(),
          api.resources()
        ]);
        setAchievements(achRes.data || []);
        setNews(newsRes.data || []);
        setResources(resRes.data || []);
      } catch (e) { 
        console.error('Failed to load authenticated data:', e); 
      }
      setLoading(false);
    };
    loadAuthed();
  }, [token, user]);

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.ok) {
      // Check if 2FA is required
      if (result.token === "2FA_REQUIRED") {
        // 2FA is currently disabled in backend. 
        // If this is reached, redirect to 2FA page or handle as failure
        setTwoFactorEmail(email);
        setCurrentPage("2fa");
        return true;
      }
      
      // currentUser will be set by the useEffect that watches 'user'
      const userRole = result.user?.role;
      if (userRole === "Leader") {
        setCurrentPage("leader-dashboard");
      } else {
        setCurrentPage("member-dashboard");
      }
    }
    return result.ok;
  };

  const handle2FAVerify = (userData) => {
    console.log('2FA verification successful:', userData);
    
    // Set token and user in useAuth hook
    const accessToken = userData.accessToken || userData.token;
    const userInfo = userData.user;
    
    console.log('Setting auth data:', { accessToken, userInfo });
    
    // Store in localStorage directly and update auth state
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    
    // Store intended dashboard based on user role
    const targetPage = userInfo?.role === "Leader" ? "leader-dashboard" : "member-dashboard";
    localStorage.setItem('postLoginPage', targetPage);
    
    // Update local state
    const user = apiUserToLocal(userInfo);
    setCurrentUser(user);
    setTwoFactorEmail(null);
    
    // Force page refresh to ensure auth state is properly loaded
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setCurrentPage("home");
  };

  const handleRegister = async (userData) => {
    try {
      await api.register(userData);
      toast.success("Registration successful! Please wait for leader approval.");
      return true;
    } catch (error) {
      console.error("Registration error", error);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleApproveUser = async (userId) => {
    if (!token) {
      toast.error("Please login to approve users");
      return;
    }
    try {
      await api.approveUser(token, userId);
      toast.success("User approved successfully");
      // Refresh user data immediately
      await refreshUserData();
    } catch (e) {
      console.error("Approve user error:", e);
      toast.error(e.message || "Failed to approve user");
    }
  };

  const handleRejectUser = async (userId) => {
    if (!token) {
      toast.error("Please login to reject users");
      return;
    }
    try {
      await api.rejectUser(token, userId);
      toast.success("User rejected successfully");
      // Refresh user data immediately
      await refreshUserData();
    } catch (e) {
      console.error("Reject user error:", e);
      toast.error(e.message || "Failed to reject user");
    }
  };

  const refreshUserData = async () => {
    if (!token) return;
    try {
      const [approvedRes, pendingRes] = await Promise.all([
        api.approvedUsers(token),
        api.pendingUsers(token)
      ]);
      
      const mergedUsers = [
        ...(approvedRes.data || []),
        ...(pendingRes.data || [])
      ].map(apiUserToLocal);
      setUsers(mergedUsers);
    } catch (e) {
      console.error("Failed to refresh user data:", e);
    }
  };

  const refreshEventData = async () => {
    try {
      const eventsRes = await api.events();
      
      let attLocal = [];
      if (token && user) {
        const attendanceRes = (user.role === 'Leader')
          ? await api.allAttendance(token).catch(() => ({ data: [] }))
          : await api.attendanceByUser(token, user.id).catch(() => ({ data: [] }));
        attLocal = (attendanceRes.data || []).map(apiAttendanceToLocal);
        setAttendance(attLocal);
      }
      const mergedEvents = mergeRsvps((eventsRes.data || []).map(apiEventToLocal), attLocal);
      setEvents(mergedEvents);
    } catch (e) {
      console.error("Failed to refresh event data:", e);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    if (!token) {
      toast.error("Please login to update profile");
      return;
    }
    try {
      const res = await api.updateUser(token, userId, updates);
      if (res.success) {
        // Refresh user data
        const [profileRes, approvedRes, pendingRes] = await Promise.all([
          api.getProfile().catch(() => ({ data: null })),
          api.approvedUsers(token).catch(() => ({ data: [] })),
          api.pendingUsers(token).catch(() => ({ data: [] }))
        ]);
        
        // Update users list
        const mergedUsers = [
          ...(approvedRes.data || []),
          ...(pendingRes.data || []),
        ].map(apiUserToLocal);
        setUsers(mergedUsers);
        
        // Update current user if it's the same user
        if (currentUser?.id === userId && profileRes.data) {
          const updatedUser = apiUserToLocal(profileRes.data);
          setCurrentUser(updatedUser);
        }
        
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update user: " + (res.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update user");
    }
  };

  const handleDeactivateUser = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, approved: false } : u));
  };

  const handleCreateEvent = async (eventData) => {
    if (!token) {
      toast.error("Please login to create events");
      return;
    }
    try {
      await api.createEvent(token, eventData);
      toast.success("Event created successfully");
      await refreshEventData();
    } catch (e) {
      console.error("Create event error:", e);
      toast.error(e.message || "Failed to create event");
    }
  };

  const handleUpdateEvent = async (eventId, updates) => {
    if (!token) {
      toast.error("Please login to update events");
      return;
    }
    try {
      await api.updateEvent(token, eventId, updates);
      toast.success("Event updated successfully");
      await refreshEventData();
    } catch (e) {
      console.error("Update event error:", e);
      toast.error(e.message || "Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!token) {
      toast.error("Please login to delete events");
      return;
    }
    try {
      await api.deleteEvent(token, eventId);
      toast.success("Event deleted successfully");
      await refreshEventData();
    } catch (e) {
      console.error("Delete event error:", e);
      toast.error(e.message || "Failed to delete event");
    }
  };

  const handleRSVP = async (eventId, userId) => {
    if (!token || !user) {
      toast.error('Please login to RSVP');
      return;
    }
    try {
      const currentUserId = user.id;
      const currentEvent = events.find(e => e.id === eventId);
      const isCurrentlyRSVPed = currentEvent?.rsvps.includes(currentUserId);
      const status = isCurrentlyRSVPed ? "Not Going" : "Going";
      
      const rsvpPayload = { eventId, status };
      
      await api.rsvp(token, rsvpPayload);
      
      toast.success(status === "Going" ? "RSVP Success!" : "RSVP Cancelled");
      
      const eventsRes = await api.events();
      const attendanceRes = (user.role === 'Leader')
        ? await api.allAttendance(token).catch(() => ({ data: [] }))
        : await api.attendanceByUser(token, user.id).catch(() => ({ data: [] }));

      const attLocal = (attendanceRes.data || []).map(apiAttendanceToLocal);
      setAttendance(attLocal);
      setEvents(mergeRsvps((eventsRes.data || []).map(apiEventToLocal), attLocal));
    } catch (e) {
      console.error('RSVP error:', e);
      toast.error(e.message || "Failed to RSVP");
    }
  };

  const handleMarkAttendance = async (eventId, userId, present) => {
    if (!token) return;
    try {
      await api.markAttendance(token, { eventId, userId, present });
      toast.success(`Member marked as ${present ? 'Present' : 'Absent'}`);

      // Refresh data
      const eventsRes = await api.events();
      const attendanceRes = (currentUser?.role === 'Leader')
        ? await api.allAttendance(token).catch(() => ({ data: [] }))
        : await api.attendanceByUser(token, currentUser.id).catch(() => ({ data: [] }));

      const attLocal = (attendanceRes.data || []).map(apiAttendanceToLocal);
      setAttendance(attLocal);
      setEvents(mergeRsvps((eventsRes.data || []).map(apiEventToLocal), attLocal));
    } catch (e) {
      console.error("Attendance update error:", e);
      toast.error(e.message || "Failed to update attendance");
    }
  };

  const handleSaveAttendance = async (eventId, marks) => {
    if (!token) return;
    try {
      await api.saveAttendance(token, { eventId, marks });
      toast.success('Attendance saved. You can edit it anytime.');

      const eventsRes = await api.events();
      const attendanceRes = (currentUser?.role === 'Leader')
        ? await api.allAttendance(token).catch(() => ({ data: [] }))
        : await api.attendanceByUser(token, currentUser.id).catch(() => ({ data: [] }));

      const attLocal = (attendanceRes.data || []).map(apiAttendanceToLocal);
      setAttendance(attLocal);
      setEvents(mergeRsvps((eventsRes.data || []).map(apiEventToLocal), attLocal));
    } catch (e) {
      console.error("Attendance save error:", e);
      toast.error(e.message || "Failed to save attendance");
      throw e;
    }
  };

  const navigateTo = (page, userId, eventId) => {
    setCurrentPage(page);
    if (userId) setSelectedUserId(userId);
    if (eventId) setSelectedEventId(eventId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} events={events} users={users.filter(u => u.approved)} />;

      case 'login':
        return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} />;

      case 'register':
        return <RegistrationPage onRegister={handleRegister} navigateTo={navigateTo} />;

      case 'forgot-password':
        return <ForgotPasswordPage navigateTo={navigateTo} />;

      case 'reset-password':
        return <ResetPasswordPage navigateTo={navigateTo} />;

      case '2fa':
        return <TwoFactorPage email={twoFactorEmail} onVerify={handle2FAVerify} navigateTo={navigateTo} />;

      case 'leader-dashboard':
        return currentUser?.role === 'Leader' ? (
          <LeaderDashboard
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            users={users}
            events={events}
            attendance={attendance}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
          />
        ) : <HomePage navigateTo={navigateTo} events={events} users={users.filter(u => u.approved)} />;

      case 'member-dashboard':
        return currentUser?.role === 'Member' ? (
          <MemberDashboard
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            events={events}
            attendance={attendance}
            onRSVP={handleRSVP}
          />
        ) : <HomePage navigateTo={navigateTo} events={events} users={users.filter(u => u.approved)} />;

      case 'members':
        return currentUser?.role === 'Leader' ? (
          <MemberManagement
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            users={users}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onDeactivateUser={handleDeactivateUser}
            onUpdateUser={handleUpdateUser}
          />
        ) : <HomePage navigateTo={navigateTo} events={events} users={users.filter(u => u.approved)} />;

      case 'events':
        return (
          <EventManagement
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            events={events}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onRSVP={handleRSVP}
            token={token}
          />
        );

      case 'attendance':
        return (
          <AttendancePage
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            events={events}
            users={users}
            attendance={attendance}
            onMarkAttendance={handleMarkAttendance}
            onSaveAttendance={handleSaveAttendance}
            initialEventId={selectedEventId}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            users={users}
            selectedUserId={selectedUserId}
            onUpdateUser={handleUpdateUser}
            token={token}
          />
        );

      case 'achievements':
        return (
          <AchievementsPage
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            achievements={achievements}
            onAchievementsChange={(updatedList) => setAchievements(updatedList)}
          />
        );

      case 'news':
        return (
          <NewsPage
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            news={news}
            onNewsChange={(updatedList) => setNews(updatedList)}
          />
        );

      case 'news-detail':
        return (
          <NewsDetail
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            newsItem={news.find(n => n.id === selectedEventId)}
          />
        );

      case 'resources':
        return (
          <ResourcesPage
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
            resources={resources}
            onResourcesChange={(updatedList) => setResources(updatedList)}
          />
        );

      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
}

function apiUserToLocal(u) {
  return {
    id: u?.id,
    username: u?.username || u?.email || "",
    email: u?.email || "",
    password: "",
    fullName: u?.fullName || u?.username || "",
    phone: u?.phone || "",
    role: (u?.role === "Leader" ? "Leader" : "Member"),
    approved: !!u?.approved,
    profileImage: u?.profileImage,
    status: u?.status,
  };
}

function apiEventToLocal(e) {
  return {
    id: e?.id,
    title: e?.eventName || e?.title,
    description: e?.description,
    date: e?.eventDate || e?.date,
    time: e?.time,
    location: e?.location,
    image: e?.coverImage || e?.image,
    rsvps: [],
    createdBy: "",
  };
}

function apiAttendanceToLocal(a) {
  return {
    id: a?.id,
    eventId: a?.event?.id || a?.eventId,
    userId: a?.member?.user?.id || a?.userId,
    present: a?.present === true,
  };
}

function mergeRsvps(events, attendance) {
  return events.map(ev => {
    // Any attendance row (RSVP or leader mark) counts as engagement for the event
    const rsvps = attendance
      .filter(a => a.eventId === ev.id)
      .map(a => a.userId)
      .filter(Boolean);
    return { ...ev, rsvps };
  });
}

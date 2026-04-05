import { useState, useCallback } from "react";

export interface AddOn {
  id: string;
  name: string;
  price: number;
  oneOffDate?: string | null;
}

export interface Subscription {
  id: string;
  planType: string;
  status: "active" | "paused" | "cancelled";
  price: number;
  addOnsPrice?: number;
  totalPrice?: number;
  addOns?: AddOn[];
  deliveryDays: string[];
  startDate: string | null;
  endDate?: string | null;
  createdAt: string;
}

interface SkipDatesPayload {
  dates: string[]; // ISO date strings: "2026-04-05"
}

interface PauseDateRangePayload {
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

interface ChangeSchedulePayload {
  frequency: string;
  deliveryDays: string[];
}

interface ChangePlanPayload {
  planType: string;
}

export function useSubscriptions(token: string | null) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/subs/my-subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      } else {
        setError("Failed to load subscriptions");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const pause = useCallback(
    async (subscriptionId: string, payload: PauseDateRangePayload) => {
      if (!token) return false;
      setActionLoading(subscriptionId + ":pause");
      try {
        const res = await fetch(`/api/subs/${subscriptionId}/pause`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchSubscriptions();
          return true;
        } else {
          setError("Failed to pause subscription");
          return false;
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchSubscriptions]
  );

  const resume = useCallback(
    async (subscriptionId: string) => {
      if (!token) return false;
      setActionLoading(subscriptionId + ":resume");
      try {
        const res = await fetch(`/api/subs/${subscriptionId}/resume`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await fetchSubscriptions();
          return true;
        } else {
          setError("Failed to resume subscription");
          return false;
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchSubscriptions]
  );

  const skip = useCallback(
    async (subscriptionId: string, payload: SkipDatesPayload) => {
      if (!token) return false;
      setActionLoading(subscriptionId + ":skip");
      try {
        const res = await fetch(`/api/subs/${subscriptionId}/skip`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchSubscriptions();
          return true;
        } else {
          setError("Failed to skip dates");
          return false;
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchSubscriptions]
  );

  const changeSchedule = useCallback(
    async (subscriptionId: string, payload: ChangeSchedulePayload) => {
      if (!token) return false;
      setActionLoading(subscriptionId + ":schedule");
      try {
        const res = await fetch(`/api/subs/${subscriptionId}/schedule`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchSubscriptions();
          return true;
        } else {
          setError("Failed to change schedule");
          return false;
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchSubscriptions]
  );

  const changePlan = useCallback(
    async (subscriptionId: string, payload: ChangePlanPayload) => {
      if (!token) return false;
      setActionLoading(subscriptionId + ":plan");
      try {
        const res = await fetch(`/api/subs/${subscriptionId}/plan`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await fetchSubscriptions();
          return true;
        } else {
          setError("Failed to change plan");
          return false;
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchSubscriptions]
  );

  const cancel = useCallback(
    async (subscriptionId: string) => {
      if (!token) return false;
      setActionLoading(subscriptionId + ":cancel");
      try {
        const res = await fetch(`/api/subs/${subscriptionId}/cancel`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await fetchSubscriptions();
          return true;
        } else {
          setError("Failed to cancel subscription");
          return false;
        }
      } catch (err) {
        setError("Network error");
        console.error(err);
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchSubscriptions]
  );

  return {
    subscriptions,
    loading,
    error,
    actionLoading,
    fetch: fetchSubscriptions,
    pause,
    resume,
    skip,
    changeSchedule,
    changePlan,
    cancel,
    clearError: () => setError(null),
  };
}

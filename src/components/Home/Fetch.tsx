"use client";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

export default function Fetch() {
  const { user, loading } = useContext(AuthContext) || {};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div>
      {user.isAdmin ? "User is an Admin" : "User is not an Admin"}
    </div>
  );
}

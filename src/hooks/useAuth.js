"use client";

import { useSelector, useDispatch } from "react-redux";
import { logingAuth, logoutUser, updateProfile } from "@/redux/slices/authSlice";
import { emptyStore } from "@/redux/actions";
import {
  login as apiLogin,
  signUp as apiSignUp,
  logout as apiLogout,
  getProfile,
} from "@/services/authService";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.authSlice) || {};

  /**
   * Sign in user with email & password and sync profile to Redux
   */
  const signIn = async ({ email, password }) => {
    const data = await apiLogin({ email, password });
    const user = data?.user;
    const session = data?.session;
    const profile = data?.profile;

    if (session) {
      dispatch(emptyStore());
      dispatch(
        logingAuth({
          userData: {
            ...user,
            profile,
          },
          token: session.access_token,
          userId: user?.id,
          role: profile?.role || "student",
        }),
      );
    }

    return data;
  };

  /**
   * Sign up new user with details and profile creation
   */
  const signUp = async ({ email, password, fullName, phone }) => {
    const data = await apiSignUp({ email, password, fullName, phone });
    const user = data?.user;
    const session = data?.session;
    const profile = data?.profile;

    if (session) {
      dispatch(emptyStore());
      dispatch(
        logingAuth({
          userData: {
            ...user,
            profile,
          },
          token: session.access_token,
          userId: user?.id,
          role: profile?.role || "student",
        }),
      );
    }

    return data;
  };

  /**
   * Logout user and reset session
   */
  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore API logout error and clear local session anyway
    } finally {
      dispatch(logoutUser());
      router.replace("/sign-in");
    }
  };

  /**
   * Fetch/refresh profile from public.profiles table
   */
  const fetchProfile = async () => {
    if (!authState.userId) return null;
    try {
      const profile = await getProfile(authState.userId);
      if (profile) {
        dispatch(
          updateProfile({
            profile,
          }),
        );
      }
      return profile;
    } catch (error) {
      console.warn("Failed to refresh profile:", error);
      return null;
    }
  };

  const userData = authState.userData || {};
  const profile = userData.profile || null;
  const role = authState.role || profile?.role || "student";
  const fullName = profile?.full_name || userData.user_metadata?.full_name || "";
  const email = profile?.email || userData.email || "";
  const phone = profile?.phone || "";

  return {
    user: userData,
    userId: authState.userId,
    token: authState.token,
    role,
    profile,
    fullName,
    email,
    phone,
    isAuthenticated: Boolean(authState.token),
    signIn,
    login: signIn,
    signUp,
    signup: signUp,
    logout,
    fetchProfile,
  };
};

export default useAuth;

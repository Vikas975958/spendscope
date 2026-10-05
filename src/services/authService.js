import { supabase } from "@/lib/supabaseconfig";

/**
 * Create or update profile in public.profiles table
 */
export const createOrUpdateProfile = async ({
  userId,
  fullName,
  email,
  phone = null,
  currency = "INR",
  currency_symbol = "₹",
  avatar = null,
  role = "student",
  approved = false,
  active = true,
}) => {
  const profilePayload = {
    id: userId,
    full_name: fullName,
    email: email,
    phone: phone || null,
    currency: currency || "INR",
    currency_symbol: currency_symbol || "₹",
    avatar: avatar || null,
    role: role || "student",
    approved: approved ?? false,
    active: active ?? true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert([profilePayload], { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.warn("Profile table operation warning:", error.message);
  }

  return data || profilePayload;
};

/**
 * Get profile record for a user
 */
export const getProfile = async (userId) => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Get profile warning:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Error fetching user profile:", err);
    return null;
  }
};

/**
 * Sign up a new user and create their profile details
 */
export const signUp = async ({
  email,
  password,
  fullName,
  phone = null,
  currency = "INR",
  currencySymbol = "₹",
}) => {
  const cleanFullName = fullName ? fullName.trim() : email.split("@")[0];

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: cleanFullName,
        phone: phone || null,
        currency: currency || "INR",
        currency_symbol: currencySymbol || "₹",
      },
    },
  });

  if (error) {
    throw error;
  }

  let profile = null;

  // Insert profile details into public.profiles if user creation succeeded
  if (data?.user?.id) {
    try {
      profile = await createOrUpdateProfile({
        userId: data.user.id,
        fullName: cleanFullName,
        email: email,
        phone: phone || null,
        currency: currency || "INR",
        currency_symbol: currencySymbol || "₹",
        role: "student",
        approved: false,
        active: true,
      });
    } catch (profileErr) {
      console.warn("Error saving profile details during signup:", profileErr);
    }
  }

  return {
    ...data,
    profile,
  };
};

/**
 * Update existing user profile and auth metadata
 */
export const updateUserProfile = async ({
  userId,
  fullName,
  email,
  phone = null,
  currency = "INR",
  currencySymbol = "₹",
}) => {
  try {
    const authUpdates = {
      data: {
        full_name: fullName,
        phone: phone || null,
        currency: currency || "INR",
        currency_symbol: currencySymbol || "₹",
      },
    };
    if (email) {
      authUpdates.email = email;
    }
    await supabase.auth.updateUser(authUpdates);
  } catch (err) {
    console.warn("Update auth user warning:", err);
  }

  return await createOrUpdateProfile({
    userId,
    fullName,
    email,
    phone,
    currency,
    currency_symbol: currencySymbol,
  });
};

/**
 * Login user and fetch their profile
 */
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  let profile = null;
  if (data?.user?.id) {
    profile = await getProfile(data.user.id);
  }

  return {
    ...data,
    profile,
  };
};

/**
 * Logout current user
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return true;
};

/**
 * Get currently logged-in user
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};

/**
 * Get current session
 */
export const getSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
};

/**
 * Map Supabase auth errors to user-friendly messages
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";
  if (typeof error === "string") return error;

  const rawMessage = error?.message || error?.error_description || error?.msg || "";
  const message = String(rawMessage).toLowerCase();
  const code = String(error?.code || error?.status || "").toLowerCase();

  if (
    code === "invalid_credentials" ||
    code === "400" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("invalid email or password")
  ) {
    return "Invalid email or password. Please try again.";
  }

  if (
    code === "user_not_found" ||
    message.includes("user not found") ||
    message.includes("user does not exist")
  ) {
    return "No account found with this email.";
  }

  if (
    message.includes("user already registered") ||
    message.includes("user already exists") ||
    code === "user_already_exists"
  ) {
    return "An account with this email already exists.";
  }

  if (message.includes("email not confirmed") || code === "email_not_confirmed") {
    return "Please verify your email before logging in.";
  }

  if (
    message.includes("password should be at least 6 characters") ||
    message.includes("password must be at least")
  ) {
    return "Password must be at least 6 characters.";
  }

  if (message.includes("invalid email") || code === "invalid_email") {
    return "Please enter a valid email address.";
  }

  if (
    message.includes("too many requests") ||
    message.includes("rate limit") ||
    code === "too_many_requests" ||
    code === "429"
  ) {
    return "Too many attempts. Please try again in a moment.";
  }

  return rawMessage || "An unexpected error occurred. Please try again.";
};

/**
 * Verify user password against Supabase authentication
 */
export const verifyUserPassword = async (email, password) => {
  try {
    if (!email || !password) {
      return { isValid: false, error: "Please enter your password." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        isValid: false,
        error: "Incorrect password. Please enter the correct password.",
      };
    }

    return { isValid: true, user: data?.user };
  } catch (err) {
    return {
      isValid: false,
      error: "Incorrect password. Please enter the correct password.",
    };
  }
};
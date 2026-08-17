import { supabase } from "@/lib/supabase";

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Lỗi đăng xuất:", error.message);
    throw error;
  }

 
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}
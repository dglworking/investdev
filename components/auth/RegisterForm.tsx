"use client";

import { useState } from "react";
import { register } from "@/features/auth/register";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { error } = await register(email, password);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Register successfully!");

    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Create your account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>

            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={handleRegister}
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
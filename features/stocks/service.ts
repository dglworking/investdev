import { API } from "./api";

export async function getCryptoMarket() {
  const response = await fetch(API.crypto);

  if (!response.ok) {
    throw new Error("Failed to load crypto market.");
  }

  return response.json();
}
const API_BASE_URL = "http://localhost:8000";

export async function getStockHistory(
  symbol: string,
  start: string,
  end: string
) {
  const response = await fetch(
    `${API_BASE_URL}/market/${symbol}?start=${start}&end=${end}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stock history");
  }

  return response.json();
}
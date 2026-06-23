export async function fetchCryptoMarkets() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch crypto market.");
  }

  return response.json();
}
export async function fetchVNMarket() {

}
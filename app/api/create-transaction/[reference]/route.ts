import { NextRequest, NextResponse } from "next/server";
import { SpiServer } from "@kreyon/spi_library";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const secret = bs58.decode(process.env.PRIVATE_KEY);
const keypair = Keypair.fromSecretKey(secret);
const merchantClient = new SpiServer(
  keypair,
  "https://api.devnet.solana.com",
  "100xMerchant",
);

export async function GET() {
  const res = merchantClient.getTransferReq();

  return NextResponse.json(res);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ reference: string }> },
) {
  const { reference } = await context.params;
  const body = await req.json();
  const [referenceKey, amountStr, percentageStr] = reference.split("-");

  const amount = parseFloat(amountStr);
  const percentage = parseFloat(percentageStr);
  const refKey = new PublicKey(referenceKey);
  const userKey = new PublicKey(body?.account);

  const rawTxns = await merchantClient.transfer(
    refKey,
    amount,
    userKey,
    percentage,
    "SPI_ALGO_2",
  );

  return NextResponse.json(rawTxns);
}

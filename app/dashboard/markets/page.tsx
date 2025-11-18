"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const useTickerTape = (scriptInnerHTML: string) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = scriptInnerHTML;
    containerRef.current.appendChild(script);
  }, [scriptInnerHTML]);

  return containerRef;
};

export default function MarketsPage() {
  const tapeConfig = JSON.stringify(
    {
      symbols: [
        { proName: "BITSTAMP:BTCUSD", title: "BTC / USD" },
        { proName: "BITSTAMP:ETHUSD", title: "ETH / USD" },
        { proName: "BINANCE:SOLUSDT", title: "SOL / USDT" },
        { proName: "OANDA:EURUSD", title: "EUR / USD" },
        { proName: "OANDA:GBPUSD", title: "GBP / USD" },
        { proName: "OANDA:USDJPY", title: "USD / JPY" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "en",
    },
    null,
    2
  );

  const tapeRef = useTickerTape(tapeConfig);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-full overflow-x-hidden"
      style={{ minWidth: 0 }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Markets</h1>
        <p className="text-gray-400 mt-2">
          Live tickers and market snapshots to keep you in sync with price action.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Live Market Ticker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget" ref={tapeRef} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



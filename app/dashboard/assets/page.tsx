"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lightweight TradingView widget loader
const useTradingViewScript = (id: string, scriptInnerHTML: string) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Avoid injecting multiple times
    if (containerRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.innerHTML = scriptInnerHTML;
    containerRef.current.appendChild(script);
  }, [id, scriptInnerHTML]);

  return containerRef;
};

export default function AssetsPage() {
  const majorPairsConfig = JSON.stringify(
    {
      symbols: [
        ["BITSTAMP:BTCUSD", "BTC / USD"],
        ["BITSTAMP:ETHUSD", "ETH / USD"],
        ["OANDA:EURUSD", "EUR / USD"],
        ["OANDA:GBPUSD", "GBP / USD"],
      ],
      chartOnly: false,
      width: "100%",
      height: 400,
      locale: "en",
      colorTheme: "dark",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "normal",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      noTimeScale: false,
      valuesTracking: "1",
      container_id: "tradingview-assets-major",
    },
    null,
    2
  );

  const cryptoMajorsRef = useTradingViewScript(
    "tradingview-assets-major",
    majorPairsConfig
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-full overflow-x-hidden"
      style={{ minWidth: 0 }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Assets</h1>
        <p className="text-gray-400 mt-2">
          Explore key crypto and FX assets with live market data.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Major Markets Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="tradingview-widget-container">
            <div
              id="tradingview-assets-major"
              ref={cryptoMajorsRef}
              className="min-h-[400px]"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



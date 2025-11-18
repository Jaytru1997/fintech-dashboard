"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingViewWidget } from "@/components/trading/TradingViewWidget";
import { formatPairToTradingViewSymbol } from "@/lib/utils";

const useTradingViewEmbed = (src: string, config: string) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.innerHTML = config;
    ref.current.appendChild(script);
  }, [src, config]);

  return ref;
};

export default function MarketsPage() {
  const tapeConfig = useMemo<string>(
    () =>
      JSON.stringify(
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
      ),
    []
  );

  const overviewConfig = useMemo<string>(
    () =>
      JSON.stringify(
        {
          colorTheme: "dark",
          dateRange: "12M",
          showChart: true,
          locale: "en",
          width: "100%",
          height: "100%",
          largeChartUrl: "",
          isTransparent: true,
          showSymbolLogo: true,
          showFloatingTooltip: true,
          tabs: [
            {
              title: "Crypto",
              symbols: [
                { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
                { s: "BINANCE:ETHUSDT", d: "Ethereum" },
                { s: "BINANCE:SOLUSDT", d: "Solana" },
                { s: "BINANCE:XRPUSDT", d: "XRP" },
                { s: "BINANCE:ADAUSDT", d: "Cardano" },
              ],
            },
            {
              title: "Forex",
              symbols: [
                { s: "FX:EURUSD", d: "EUR/USD" },
                { s: "FX:GBPUSD", d: "GBP/USD" },
                { s: "FX:USDJPY", d: "USD/JPY" },
                { s: "FX:AUDUSD", d: "AUD/USD" },
                { s: "FX:USDCAD", d: "USD/CAD" },
              ],
            },
          ],
        },
        null,
        2
      ),
    []
  );

  const forexConfig = useMemo<string>(
    () =>
      JSON.stringify(
        {
          width: "100%",
          height: "100%",
          currencies: ["EUR", "USD", "JPY", "GBP", "CAD", "CHF", "AUD", "NZD"],
          isTransparent: true,
          colorTheme: "dark",
          locale: "en",
        },
        null,
        2
      ),
    []
  );

  const screenerConfig = useMemo<string>(
    () =>
      JSON.stringify(
        {
          width: "100%",
          height: "100%",
          defaultColumn: "performance",
          defaultScreen: "crypto_mkt_cap",
          market: "crypto",
          showToolbar: true,
          colorTheme: "dark",
          locale: "en",
          isTransparent: true,
        },
        null,
        2
      ),
    []
  );

  const tapeRef = useTradingViewEmbed(
    "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",
    tapeConfig
  );
  const overviewRef = useTradingViewEmbed(
    "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
    overviewConfig
  );
  const forexRef = useTradingViewEmbed(
    "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js",
    forexConfig
  );
  const screenerRef = useTradingViewEmbed(
    "https://s3.tradingview.com/external-embedding/embed-widget-screener.js",
    screenerConfig
  );

  const spotlightSymbol = formatPairToTradingViewSymbol("BTC/USD");

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

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] gap-4">
        <Card className="bg-background-darkest/70 border-none h-full">
          <CardHeader className="pb-2">
            <CardTitle>Market Spotlight</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[430px] xl:h-[450px]">
              <TradingViewWidget symbol={spotlightSymbol} className="h-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background-darkest/70 border-none">
          <CardHeader className="pb-2">
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="tradingview-widget-container h-[430px] xl:h-[450px]">
              <div className="tradingview-widget-container__widget h-full" ref={overviewRef} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-background-darkest/70 border-none">
          <CardHeader className="pb-2">
            <CardTitle>Forex Cross Rates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="tradingview-widget-container h-[340px] xl:h-[360px]">
              <div className="tradingview-widget-container__widget h-full" ref={forexRef} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background-darkest/70 border-none">
          <CardHeader className="pb-2">
            <CardTitle>Crypto Screener</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="tradingview-widget-container h-[340px] xl:h-[360px]">
              <div className="tradingview-widget-container__widget h-full" ref={screenerRef} />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}



"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary for Root Layout
 * Catches errors that occur in the root layout itself
 * Must include its own html and body tags
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            backgroundColor: "#0a0a0a",
            color: "#fafafa",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              padding: "32px",
              borderRadius: "12px",
              backgroundColor: "#171717",
              border: "1px solid #262626",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                fontSize: "48px",
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Critical Error
            </h1>
            <p
              style={{
                color: "#a1a1aa",
                marginBottom: "24px",
              }}
            >
              The application encountered a critical error. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#fafafa",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

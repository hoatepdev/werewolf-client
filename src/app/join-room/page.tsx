"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { CornerUpLeft, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { useRoomStore } from "../useRoomStore";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "react-qr-code";

export default function JoinRoomPage() {
  const socket = getSocket();
  const router = useRouter();

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const username = useRoomStore((s) => s.username);
  const setRoomCodeStore = useRoomStore((s) => s.setRoomCode);
  const setPlayerId = useRoomStore((s) => s.setPlayerId);

  const [roomCode, setRoomCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    // Request camera permission on mount
    if (typeof window !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((result) => {
          if (result.state === "granted") {
            setScanning(true);
          } else if (result.state === "prompt") {
            // Try to access camera to trigger prompt
            navigator.mediaDevices
              .getUserMedia({ video: true })
              .then(() => setScanning(true))
              .catch(() => {
                setScanError("Camera access denied or not available.");
                setScanning(false);
              });
          } else {
            setScanError("Camera access denied or not available.");
            setScanning(false);
          }
        })
        .catch(() => {
          setScanError("Camera permission check failed.");
          setScanning(false);
        });
    } else {
      // Fallback: try to access camera directly
      if (typeof window !== "undefined" && navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(() => setScanning(true))
          .catch(() => {
            setScanError("Camera access denied or not available.");
            setScanning(false);
          });
      } else {
        setScanError("Camera not supported on this device.");
        setScanning(false);
      }
    }
  }, []);

  useEffect(() => {
    if (scanning && scannerRef.current && typeof window !== "undefined") {
      setScanError(null);
      const qrRegionId = "qr-scanner";
      const qrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = qrCode;
      qrCode
        .start(
          { facingMode: "user" },
          {
            fps: 10,
            aspectRatio: 1.0,
            disableFlip: false,
            // videoContainer: scannerRef.current,
          },
          (decodedText: string) => {
            setScanning(false);
            setRoomCode(decodedText);
            // qrCode.stop().then(() => qrCode.clear());
            html5QrCodeRef.current
              ?.stop()
              .then(() => html5QrCodeRef.current?.clear());
            html5QrCodeRef.current = null;
          },
          () => {
            // Ignore per-frame scan errors; do not set scanError or stop scanning
          }
        )
        .catch(() => {
          setScanError("Camera access denied or not available.");
          setScanning(false);
        });
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear());
        html5QrCodeRef.current = null;
      }
    };
  }, [scanning]);

  useEffect(() => {
    // Listen for approval event
    const handleRoomApproved = (data: { roomCode: string }) => {
      setLoading(false);
      router.push(`/room/${data.roomCode}`);
    };
    const handleRoomRejected = (data: { message?: string }) => {
      setLoading(false);
      toast.error(data.message || "Your request to join was rejected.");
      setRoomCode("");
    };
    socket.on("player:approved", handleRoomApproved);
    socket.on("player:rejected", handleRoomRejected);
    return () => {
      socket.off("player:approved", handleRoomApproved);
      socket.off("player:rejected", handleRoomRejected);
    };
  }, [scanning, router]);

  const handleJoinRoom = async () => {
    if (!roomCode || !username) {
      toast.error("Please enter a room code and username");
      return;
    }
    setLoading(true);
    if (!socket.connected) socket.connect();
    socket.emit(
      "player:joinRoom",
      { roomCode, name: username },
      (response: { success: boolean; playerId?: string; message?: string }) => {
        if (response.success && response.playerId) {
          setPlayerId(response.playerId);
          setRoomCodeStore(roomCode);
          toast.success("Request sent! Waiting for approval...");

          //   router.push(`/room/${roomCode}`);
        } else {
          setLoading(false);
          toast.error(response.message || "Failed to join room");
        }
      }
    );
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-6 justify-between">
        <button
          className="text-2xl mr-2 hover:text-gray-400 active:text-gray-500"
          aria-label="Back"
          onClick={() => router.back()}
        >
          <CornerUpLeft className="w-6 h-6 text-gray-400" />
        </button>
      </div>
      <div className="flex flex-col items-center flex-1 justify-center px-4">
        <div className="relative w-full max-w-xs aspect-square mx-auto flex items-center justify-center p-6">
          {scanning && (
            <div
              ref={scannerRef}
              id="qr-scanner"
              className="absolute inset-0 rounded-2xl overflow-hidden z-20 w-full h-full border-none"
            />
          )}
          {scanError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30 rounded-2xl">
              <span className="text-red-400 text-center">{scanError}</span>
            </div>
          )}
          {!scanning && !scanError && roomCode && (
            <QRCode
              value={roomCode}
              //   size={180}
              bgColor="#fff"
              fgColor="#000"
              className="rounded-xl"
            />
          )}
          <div className="absolute left-0 top-0 w-7 h-7 border-t-4 border-l-4 border-yellow-400 rounded-tl-2xl" />
          <div className="absolute right-0 top-0 w-7 h-7 border-t-4 border-r-4 border-yellow-400 rounded-tr-2xl" />
          <div className="absolute left-0 bottom-0 w-7 h-7 border-b-4 border-l-4 border-yellow-400 rounded-bl-2xl" />
          <div className="absolute right-0 bottom-0 w-7 h-7 border-b-4 border-r-4 border-yellow-400 rounded-br-2xl" />
          <div className="absolute flex gap-3 left-1/2 -translate-x-1/2 bottom-4 z-10"></div>
        </div>
        <div className="mt-8 mb-16 w-full text-center">
          <p className="text-zinc-400 text-base font-medium">
            Scan a code to request to join a game
          </p>
        </div>
        <Input
          className="max-w-xs mx-auto text-lg h-16 text-white bg-zinc-800 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Or enter game code"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value);
          }}
        />
      </div>
      <div className="w-full mb-2 flex flex-col mx-auto mt-auto max-w-sm">
        <Button
          variant="yellow"
          className="w-full"
          type="button"
          disabled={!roomCode || loading}
          onClick={handleJoinRoom}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" />
              <span>Waiting for approval</span>
            </div>
          ) : (
            <div>Request to join</div>
          )}
        </Button>
      </div>
    </main>
  );
}

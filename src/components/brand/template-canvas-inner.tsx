"use client";

import { useEffect, useState } from "react";
import { Layer, Rect, Stage, Text } from "react-konva";
import type { KonvaLayer } from "@/lib/ai/layoutSuggest";
import { Button } from "@/components/ui/button";

const defaultLayers: KonvaLayer[] = [
  { id: "bg", type: "rect", x: 0, y: 0, width: 1080, height: 1080, fill: "#0B0B1A" },
  {
    id: "t1",
    type: "text",
    x: 80,
    y: 200,
    text: "Başlık",
    fill: "#ffffff",
    fontSize: 64,
  },
];

export default function TemplateCanvasInner({
  initialLayers,
  onJsonChange,
}: {
  initialLayers?: KonvaLayer[];
  onJsonChange?: (layers: KonvaLayer[]) => void;
}) {
  const [layers, setLayers] = useState<KonvaLayer[]>(initialLayers ?? defaultLayers);

  useEffect(() => {
    onJsonChange?.(layers);
  }, [layers, onJsonChange]);

  return (
    <div className="space-y-4">
      <div className="overflow-auto rounded-xl border border-white/10 bg-black/20 p-4">
        <Stage width={540} height={540} scaleX={0.5} scaleY={0.5}>
          <Layer>
            {layers.map((l) => {
              if (l.type === "rect") {
                return (
                  <Rect
                    key={l.id}
                    id={l.id}
                    x={l.x}
                    y={l.y}
                    width={l.width ?? 0}
                    height={l.height ?? 0}
                    fill={l.fill}
                  />
                );
              }
              if (l.type === "text") {
                return (
                  <Text
                    key={l.id}
                    id={l.id}
                    x={l.x}
                    y={l.y}
                    text={l.text}
                    fill={l.fill}
                    fontSize={l.fontSize}
                    draggable
                    onDragEnd={(e) => {
                      const node = e.target;
                      setLayers((prev) =>
                        prev.map((x) =>
                          x.id === l.id ? { ...x, x: node.x(), y: node.y() } : x,
                        ),
                      );
                    }}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            setLayers((p) => [
              ...p,
              {
                id: `t-${Date.now()}`,
                type: "text",
                x: 120,
                y: 400,
                text: "Yeni metin",
                fill: "#a78bfa",
                fontSize: 36,
              },
            ])
          }
        >
          Metin ekle
        </Button>
      </div>
    </div>
  );
}

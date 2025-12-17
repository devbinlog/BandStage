"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ChromePicker = dynamic(
  () => import("react-color").then((mod) => mod.ChromePicker),
  { ssr: false }
);

interface ColorResult {
  hex: string;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  isEditing: boolean;
}

export function TicketDesigner() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextIdRef = useRef(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    const newText: TextElement = {
      id: `text-${nextIdRef.current++}`,
      text: "새 텍스트",
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#ffffff",
      fontFamily: "sans-serif",
      isEditing: true,
    };
    setTextElements([...textElements, newText]);
    setSelectedTextId(newText.id);
  };

  const updateText = (id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updates } : text))
    );
  };

  const deleteText = (id: string) => {
    setTextElements((prev) => prev.filter((text) => text.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
      setShowColorPicker(false);
    }
  };

  const handleTextMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedTextId(id);
    const text = textElements.find((t) => t.id === id);
    if (text) {
      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - text.x,
          y: e.clientY - rect.top - text.y,
        });
      }
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && selectedTextId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left - dragOffset.x;
        let y = e.clientY - rect.top - dragOffset.y;
        
        // 캔버스 경계 내로 제한
        const maxX = rect.width - 50;
        const maxY = rect.height - 50;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        updateText(selectedTextId, { x, y });
      }
    },
    [isDragging, selectedTextId, dragOffset]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleColorChange = (color: any) => {
    if (selectedTextId && color?.hex) {
      updateText(selectedTextId, { color: color.hex });
    }
  };

  const downloadTicket = () => {
    if (!canvasRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;

    // 배경 그리기
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 텍스트 그리기
        textElements.forEach((text) => {
          ctx.fillStyle = text.color;
          ctx.font = `${text.fontSize}px ${text.fontFamily}`;
          ctx.textBaseline = "top";
          ctx.fillText(text.text, text.x, text.y);
        });

        // 다운로드
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "ticket-design.png";
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      img.src = backgroundImage;
    } else {
      // 배경 이미지가 없으면 흰색 배경
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      textElements.forEach((text) => {
        ctx.fillStyle = text.color;
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.fillText(text.text, text.x, text.y);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "ticket-design.png";
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  const selectedText = textElements.find((t) => t.id === selectedTextId);

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            이미지 업로드
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            onClick={addText}
            className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            텍스트 추가
          </button>

          {selectedText && (
            <>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                색상 변경
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">크기:</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={selectedText.fontSize}
                  onChange={(e) =>
                    updateText(selectedText.id, {
                      fontSize: parseInt(e.target.value),
                    })
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-900">{selectedText.fontSize}px</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">폰트:</label>
                <select
                  value={selectedText.fontFamily}
                  onChange={(e) =>
                    updateText(selectedText.id, { fontFamily: e.target.value })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900"
                >
                  <option value="sans-serif">기본</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>

              <button
                onClick={() => deleteText(selectedText.id)}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                삭제
              </button>
            </>
          )}

          <div className="ml-auto">
            <button
              onClick={downloadTicket}
              className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              다운로드
            </button>
          </div>
        </div>

        {showColorPicker && selectedText && (
          <div className="mt-4 flex justify-center">
            <ChromePicker color={selectedText.color} onChange={handleColorChange} />
          </div>
        )}
      </div>

      {/* 디자인 캔버스 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div
          ref={canvasRef}
          className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-lg bg-white shadow-2xl"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => {
            setSelectedTextId(null);
            setShowColorPicker(false);
          }}
        >
          {textElements.map((text) => (
            <div
              key={text.id}
              className="absolute cursor-move"
              style={{
                left: `${text.x}px`,
                top: `${text.y}px`,
                color: text.color,
                fontSize: `${text.fontSize}px`,
                fontFamily: text.fontFamily,
                outline:
                  selectedTextId === text.id
                    ? "2px dashed rgba(255, 255, 255, 0.5)"
                    : "none",
                padding: selectedTextId === text.id ? "4px" : "0",
              }}
              onMouseDown={(e) => handleTextMouseDown(e, text.id)}
              onClick={(e) => e.stopPropagation()}
            >
              {text.isEditing ? (
                <input
                  type="text"
                  value={text.text}
                  onChange={(e) => updateText(text.id, { text: e.target.value })}
                  onBlur={() => updateText(text.id, { isEditing: false })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateText(text.id, { isEditing: false });
                    }
                  }}
                  className="bg-transparent outline-none"
                  style={{ color: text.color, fontSize: `${text.fontSize}px` }}
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => updateText(text.id, { isEditing: true })}
                >
                  {text.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


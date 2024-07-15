import clsx from "clsx";
import { motion, useMotionValue } from "framer-motion";
import { generate } from "random-words";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

const sentence = generate({ exactly: 15, join: " " });

const splitSentence = sentence.replace(/\.|\,/g, "").split(" ");

function App() {
  const [currentText, setCurrentText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [correctWordIndexes, setCorrectWordIndexes] = useState<number[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  const letterWidth = useMotionValue(0);
  const letterHeight = useMotionValue(0);
  const letterLeft = useMotionValue(0);
  const letterTop = useMotionValue(0);

  const boxTop = useMotionValue(0);
  const boxLeft = useMotionValue(0);

  const onChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (
      value.includes(" ") ||
      value.length - 1 > splitSentence[wordIndex].length
    ) {
      setCurrentText("");
      setWordIndex((i) => (i += 1));
      if (splitSentence[wordIndex] === value.replace(/\s/, "")) {
        setCorrectWordIndexes((i) => [...i, wordIndex]);
      }
    } else {
      setCurrentText(value);
    }
  };

  useEffect(() => {
    const measures = boxRef.current?.getBoundingClientRect();
    if (measures) {
      boxTop.set(measures.y + 16);
      boxLeft.set(measures.left + 16);
    }
  }, []);

  return (
    <div className="bg-[#121212] h-screen w-screen flex flex-col items-center">
      <div
        className="bg-[#1e1e1e] h-48 mt-10 w-[50%] rounded-md p-4 select-none cursor-default relative"
        ref={boxRef}
      >
        {splitSentence.map((word, index) => (
          <Word
            key={index}
            currentTyping={currentText}
            word={word}
            wasTyped={index < wordIndex}
            isCorrect={correctWordIndexes.includes(index)}
            onChangeLetterIndex={(measures) => {
              const boxPadding = 16;
              letterLeft.set(measures.x - boxLeft.get() + boxPadding - 2);
              letterTop.set(measures.y - boxTop.get() + boxPadding - 2);
              letterHeight.set(measures.height + 6);
              letterWidth.set(measures.width + 4);
            }}
            isActive={wordIndex === index}
            letterIndex={currentText.length}
          />
        ))}
        <motion.div
          style={{
            width: letterWidth,
            height: letterHeight,
            left: letterLeft,
            top: letterTop,
          }}
          layout
          className="bg-gray-500 rounded-sm opacity-30 absolute left-3.5 top-4 transition-all text-transparent"
        />
      </div>
      <div className="bg-[#1e1e1e] w-[50%] rounded-md mt-4">
        <input
          autoCorrect="false"
          autoCapitalize="false"
          autoComplete="false"
          spellCheck="false"
          className="text-gray-200 font-mono text-lg h-full w-full  p-4 bg-transparent"
          value={currentText}
          onChange={onChangeText}
        />
      </div>
    </div>
  );
}

const Word = ({
  word,
  isCorrect,
  wasTyped,
  isActive,
  letterIndex,
  currentTyping,
  onChangeLetterIndex,
}: {
  word: string;
  isCorrect: boolean;
  wasTyped: boolean;
  isActive: boolean;
  letterIndex: number;
  currentTyping: string;
  onChangeLetterIndex: (params: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}) => {
  const splitWord = useMemo(() => word.split(""), []);
  const measuresRef = useRef<DOMRectList>();
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rects = wordRef.current?.getClientRects();
    measuresRef.current = rects!;
  }, []);

  useEffect(() => {
    if (isActive && measuresRef.current?.length) {
      const measures = measuresRef.current?.[letterIndex];

      if (measures) {
        onChangeLetterIndex({
          width: measures?.width!,
          x: measures?.left!,
          height: measures.height!,
          y: measures.top!,
        });
      }
    }
  }, [letterIndex, isActive]);

  return (
    <span
      ref={wordRef}
      className={clsx(
        "text-gray-400 font-mono text-lg",
        wasTyped ? (isCorrect ? "text-green-500" : "text-red-500") : ""
      )}
    >
      {splitWord.map((letter, index) => (
        <span
          key={index}
          className={
            isActive && index < letterIndex
              ? word.slice(0, letterIndex) ===
                currentTyping.slice(0, letterIndex)
                ? "text-green-200"
                : "text-red-200"
              : ""
          }
        >
          {letter}
        </span>
      ))}{" "}
    </span>
  );
};

export default App;

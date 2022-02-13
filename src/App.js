import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Grommet,
  Box,
  Button,
  Heading,
  Keyboard,
  Text,
  TextInput,
} from "grommet";

const theme = {
  global: {
    colors: {
      background: {
        dark: "#111111",
        light: "#FFFFFF",
      },
      brand: "#5395A9",
      focus: "brand",
      match: "#00FF0066",
      mismatch: "#FFFF0066",
      unmatch: {
        dark: "#333333",
        light: "#CCCCCC",
      },
    },
    font: {
      family: "Courier",
    },
  },
  textInput: {
    extend: "opacity: 0",
  },
};

const browserThemeMode = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const alpha = /^[a-z,A-Z]+$/;

const indexes = [0, 1, 2, 3, 4];

const letters = Array.from(Array(26))
  .map((e, i) => i + 97)
  .map((x) => String.fromCharCode(x));

const Blank = () => <>&nbsp;</>;

const check = (index, guess, word) => {
  if (!word) return undefined;
  if (guess[index] === word[index]) return "match";
  if (word.includes(guess[index])) return "mismatch";
  if (guess[index]) return "unmatch";
  return undefined;
};

const Guess = ({ guess, matches, word }) => {
  const focusIndex = guess.length === indexes.length ? undefined : guess.length;
  return (
    <Box direction="row" flex={false}>
      {indexes.map((index) => {
        const background = check(index, guess, word);

        // ensure we don't shift layout
        const border = [{ side: true, size: "small", color: "transparent" }];
        if (!word) {
          if (!guess[index]) {
            // no character here
            if (index === focusIndex)
              border.push({ side: true, size: "small", color: "focus" });
            else border.push({ side: "end", size: "small" });
          } else {
            // have a character here
            if (index === 0)
              if (focusIndex === 1)
                border.push({ side: "start", size: "small" });
              else border.push({ side: "vertical", size: "small" });
            else if (focusIndex !== index + 1)
              border.push({ side: "end", size: "small" });
          }
        } else {
          if (index > 0)
            border.push({ side: "start", size: "small", color: "background" });
        }

        // remind the user if a letter doesn't match anything
        const color =
          (guess[index] && matches && matches[guess[index]]) === "unmatch"
            ? "unmatch"
            : undefined;

        const animation = [];
        if (word) {
          animation.push({ type: "fadeIn", delay: 500 * index });
          if (word === guess)
            animation.push({ type: "pulse", delay: 2000 + (200 * index) });
        }

        return (
          <Box
            key={index}
            flex
            border={border}
            pad="small"
            background={background}
            round="xsmall"
            animation={animation}
          >
            <Text size="3xl" weight="bold" color={color}>
              {guess[index] || <Blank />}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

function App() {
  const [fetching, setFetching] = useState(true);
  const [word, setWord] = useState();
  const [guesses, setGuesses] = useState([]);
  const [guess, setGuess] = useState("");
  const [matches, setMatches] = useState({});
  const inputRef = useRef();

  const themeMode = useMemo(() => browserThemeMode(), []);

  // get a word if we don't have one
  useEffect(() => {
    if (!word) {
      setFetching(true);
      fetch("https://www.boredapi.com/api/activity")
        .then((r) => r.json())
        .then((r) => r.activity)
        .then((a) => {
          // find a five letter word
          let nextWord = a
            .split(" ")
            .filter((w) => w.length === 5)
            .filter((w) => alpha.test(w))[0];
          if (nextWord) {
            nextWord = nextWord.toLowerCase();
            setWord(nextWord);
            console.log(nextWord);
          } else console.log("couldn't find a word :(");
          setFetching(false);
        });
    }
  }, [word]);

  // update the matches map
  useEffect(() => {
    const nextMatches = {};
    guesses.forEach((guess) => {
      indexes.forEach((index) => {
        const result = check(index, guess, word);
        if (nextMatches[guess[index]] !== "match")
          nextMatches[guess[index]] = result;
      });
    });
    setMatches(nextMatches);
  }, [guesses, word]);

  useEffect(() => inputRef.current.focus(), []);

  return (
    <Grommet full theme={theme} themeMode={themeMode}>
      <Keyboard
        target="document"
        onEnter={
          guess.length === indexes.length
            ? () => {
                const nextGuesses = [...guesses];
                nextGuesses.push(guess);
                setGuesses(nextGuesses);
                setGuess("");
              }
            : undefined
        }
        onBackspace={() => setGuess(guess.slice(0, -1))}
        onKeyDown={
          guess.length < indexes.length
            ? ({ keyCode, key }) => {
                if (
                  // upper alpha (A-Z)
                  (keyCode > 64 && keyCode < 91) ||
                  // lower alpha (a-z)
                  (keyCode > 96 && keyCode < 123)
                ) {
                  setGuess(`${guess}${key.toLowerCase()}`);
                }
              }
            : undefined
        }
      >
        <Box
          fill
          align="center"
          pad="medium"
          hoverIndicator={false}
          onClick={() => inputRef.current.focus()}
        >
          <Box basis="medium" align="center" gap="medium">
            <Heading>word slot</Heading>
            <Box flex={false} gap="xsmall">
              {guesses.map((guess, index) => (
                <Guess key={index} guess={guess} word={word} />
              ))}
              {word && guesses[guesses.length - 1] !== word && (
                <Guess guess={guess} matches={matches} />
              )}
            </Box>
            <Box flex={false}>
              <Text color="text-weak">
                {guess.length === indexes.length ? (
                  "press Return or Enter to check"
                ) : (
                  <Blank />
                )}
              </Text>
            </Box>
            {(!word || guesses[guesses.length - 1] === word) && (
              <Box flex={false} animation={{ type: "fadeIn", delay: 2000 }}>
                <Button
                  label="new game"
                  disabled={fetching}
                  onClick={() => {
                    setGuesses([]);
                    setGuess("");
                    setMatches({});
                    setWord(undefined);
                  }}
                />
              </Box>
            )}
            <Box
              flex={false}
              alignSelf="stretch"
              direction="row"
              justify="center"
              wrap
            >
              {letters.map((l) => {
                const background = matches[l];
                return (
                  <Box
                    key={l + background}
                    pad={{ horizontal: "xsmall", bottom: "xsmall" }}
                    background={background}
                    round="xsmall"
                    border={{ side: true, color: "background" }}
                    animation={{ type: "fadeIn", delay: 2000 }}
                  >
                    <Text>{l}</Text>
                  </Box>
                );
              })}
            </Box>
            <TextInput
              ref={inputRef}
              minSize={5}
              maxSize={5}
              value={guess}
              autocomplete="off"
            />
          </Box>
        </Box>
      </Keyboard>
    </Grommet>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { Grommet, Box, Heading, Keyboard, Text } from "grommet";

const theme = {
  global: {
    colors: {
      background: "#FFFFFF",
      match: "#00FF0066",
      mismatch: "#FFFF0066",
      unmatch: "#CCCCCC",
    },
    font: {
      family: "Courier",
    },
  },
};

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

        return (
          <Box
            key={index}
            flex
            border={border}
            pad="small"
            background={background}
            round="xsmall"
          >
            <Text
              size="3xl"
              weight="bold"
              color={
                (guess[index] && matches && matches[guess[index]]) === "unmatch"
                  ? "unmatch"
                  : undefined
              }
            >
              {guess[index] || <Blank />}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

function App() {
  const [word, setWord] = useState();
  const [guesses, setGuesses] = useState([]);
  const [guess, setGuess] = useState("");
  const [matches, setMatches] = useState({});

  useEffect(() => {
    if (!word)
      fetch("https://www.boredapi.com/api/activity")
        .then((r) => r.json())
        .then((r) => r.activity)
        .then((a) => {
          // find a five letter word
          let nextWord = a.split(" ").filter((w) => w.length === 5)[0];
          if (nextWord) {
            nextWord = nextWord.toLowerCase();
            setWord(nextWord);
            console.log(nextWord);
          }
        });
  }, [word]);

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

  return (
    <Grommet full theme={theme}>
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
                  setGuess(`${guess}${key}`);
                }
              }
            : undefined
        }
      >
        <Box fill align="center" pad="medium">
          <Box basis="medium" align="center" gap="xsmall">
            <Heading>word slot</Heading>
            {guesses.map((guess, index) => (
              <Guess key={index} guess={guess} word={word} />
            ))}
            {guesses[guesses.length - 1] !== word && (
              <Guess guess={guess} matches={matches} />
            )}
            <Box flex={false} margin={{ top: "medium" }}>
              <Text color="text-weak">
                {guess.length === indexes.length ? (
                  "press Return or Enter to check"
                ) : (
                  <Blank />
                )}
              </Text>
            </Box>
            <Box
              flex={false}
              alignSelf="stretch"
              margin={{ vertical: "medium" }}
              direction="row"
              wrap
            >
              {letters.map((l) => {
                const background = matches[l];
                return (
                  <Box
                    key={l}
                    pad={{ horizontal: "xsmall", bottom: "xsmall" }}
                    background={background}
                    round="xsmall"
                    border={{ side: true, color: "background" }}
                  >
                    <Text>{l}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Keyboard>
    </Grommet>
  );
}

export default App;

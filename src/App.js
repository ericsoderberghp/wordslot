import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Grommet,
  Anchor,
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
        dark: "#FFFFFF44",
        light: "#00000033",
      },
    },
    font: {
      family: "Courier",
    },
  },
  textInput: {
    extend: "opacity: 0; cursor: pointer;",
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

const delayAnimation = { type: "fadeIn", delay: 2000 };

const check = (index, guess, word) => {
  if (!word) return undefined;
  if (guess[index] === word[index]) return "match";
  if (word.includes(guess[index])) return "mismatch";
  if (guess[index]) return "unmatch";
  return undefined;
};

const Guess = ({ guess, matches, word , giveup}) => {
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
          if (word === guess) {
            if (giveup === false)
            animation.push({ type: "pulse", delay: 2000 + 200 * index });
          }
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

const messages = {
welcome: ["Guess the five letter word"],
newMatched3: ["Are you clarvoyant!?","Time to buy some lotto tickets"],
newMatched2: ["Outstanding!","Fantastic!"],
newMatched1: ["Well done!","Impressive"],
newMisMatch2: ["Good job!","Nice!"],
newMisMatch1: ["You're making progress.","Keep chipping away at it."],
NoNew: ["Bummer.","A few options eliminated."],
winner: ["Congratulations! It took you ", " guesses."],
loser: ["You gave up after ", " guesses."],
};

function App() {
  const [fetching, setFetching] = useState();
  const [word, setWord] = useState();
  const [guesses, setGuesses] = useState([]);
  const [guess, setGuess] = useState("");
  const [themeMode, setThemeMode] = useState(browserThemeMode());
  const [giveup,setGiveup] = useState(false);
  const [foundMatches, setFoundMatches] = useState(0);
  const inputRef = useRef();

  const matches = useMemo(() => {
    const nextMatches = {};
    guesses.forEach((guess) => {
      indexes.forEach((index) => {
        const result = check(index, guess, word);
        if (nextMatches[guess[index]] !== "match") {
          nextMatches[guess[index]] = result;
        };
      });
    });
    return nextMatches;
  }, [guesses, word]);

  const done = useMemo(
    () => word && guesses.length > 0 && guesses[guesses.length - 1] === word,
    [guesses, word]
  );

  const latestMatchCounts = useMemo(() => {
    const allResults = letters.map((l) => matches[l]);
    const newMatches = allResults.filter(x => x==="match").length - foundMatches;
    setFoundMatches(foundMatches + newMatches);
    const newMisMatches = allResults.filter(x => x==="mismatch").length;
    console.log(newMatches, newMisMatches);
    return {newMatches, newMisMatches};
  }, [matches]);

  const message = useMemo(() => {
    const randomMessage = (messages) => messages[Math.floor(Math.random() * messages.length)];
    if (!guesses.length) return randomMessage(messages.welcome);
    if (latestMatchCounts.newMatches === 1 && !done) return randomMessage(messages.newMatched1);
    if (latestMatchCounts.newMatches === 2 && !done) return randomMessage(messages.newMatched2);
    if (latestMatchCounts.newMatches === 3 && !done) return randomMessage(messages.newMatched3);
    if (latestMatchCounts.newMisMatches === 1 && !done) return randomMessage(messages.newMisMatch1);
    if (latestMatchCounts.newMisMatches === 2 && !done) return randomMessage(messages.newMisMatch2);
    if (!done) return randomMessage(messages.NoNew);
    if (done && giveup === false) return messages.winner[0] + guesses.length + messages.winner[1];
    if (done && giveup === true) return messages.loser[0] + String(guesses.length-1) + messages.loser[1];
    return "";
<<<<<<< HEAD
  }, [done, giveup, guesses, latestMatchCounts]);
=======
  }, [done, giveup, guesses]);
>>>>>>> 2b1bcc571f8b0e0db344437d6ee4c36f27d42731

  const getWord = () => {
    setFetching(true);
    setThemeMode(browserThemeMode());
    // fetch("https://www.boredapi.com/api/activity")
    // fetch("https://www.randomlists.com/data/words.json")
    fetch("https://random-word-api.herokuapp.com/word?number=30")
      .then((r) => r.json())
      .then((words) => {
        // find a five letter word
        let validWords = words
          .filter((w) => w.length === 5)
          .filter((w) => alpha.test(w));
        // choose a random one
        let nextWord =
          validWords[Math.floor(Math.random() * validWords.length)];
        if (nextWord) {
          nextWord = nextWord.toLowerCase();
          setWord(nextWord);
          setGuesses([]);
          setGuess("");
          console.log(nextWord);
        } else console.log("couldn't find a word :(");
        setFetching(false);
      })
      .catch(() => { })
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    if (word) inputRef.current.focus();
  }, [word]);

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
          overflow="auto"
          align="center"
          pad="medium"
          hoverIndicator={false}
          focusIndicator={false}
          onClick={() => inputRef.current.focus()}
        >
          <Box basis="medium" align="center" gap="medium">
            <Box flex={false} align="center">
              <Heading margin="none">word slot</Heading>
              <Box key={guesses.length} animation={delayAnimation}>
                <Text color="text-xweak" textAlign="center">{message}</Text>
              </Box>
            </Box>

            <Box flex={false} gap="xsmall">
              {guesses.map((guess, index) => (
                <Guess key={index} guess={guess} word={word} />
              ))}
              {word && guesses[guesses.length - 1] !== word && (
                <Box
                  key={guesses.length}
                  animation={guesses.length ? delayAnimation : undefined}
                >
                  <Guess guess={guess} matches={matches} />
                </Box>
              )}
            </Box>

            <Box
              key={guesses.length}
              flex={false}
              align="center"
              gap="medium"
              animation={delayAnimation}
            >
              {(guess.length === indexes.length && (
                <Text color="text-weak">press return to check</Text>
              )) ||
                (done && (
                  <Anchor
                    label="definition"
                    href={`https://www.thefreedictionary.com/${word}`}
                    target="_blank"
                  />
                )) || <Blank />}
              <Box
                flex={false}
                alignSelf="stretch"
                direction="row"
                justify="center"
                wrap
              >
                {guesses.length > 0 &&
                  letters.map((l) => {
                    const background = matches[l];
                    return (
                      <Box
                        key={l + background}
                        pad={{ horizontal: "xsmall", bottom: "xsmall" }}
                        background={background}
                        round="xsmall"
                        border={{ side: true, color: "background" }}
                        animation={delayAnimation}
                      >
                        <Text>{l}</Text>
                      </Box>
                    );
                  })}
              </Box>
              {(!word || done) && (
                <Button
                  label="new game"
                  disabled={fetching}
                  onClick={() => {
                    setGuesses([]);
                    setGuess("");
                    setWord(undefined);
                    setGiveup(false);
                    getWord();
                    setFoundMatches(0);
                  }}
                />
              )}
              {(word && guesses.length > 5 && !done) && (
                <Button
                  label="Give up"
                  onClick={() => {
                    const nextGuesses = [...guesses];
                    nextGuesses.push(word);
                    setGuesses(nextGuesses);
                    setGuess("");
                    setGiveup(true);
                  }}
                />
              )}
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

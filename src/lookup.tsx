import { useCachedPromise, usePromise } from "@raycast/utils";
import { Action, ActionPanel, List } from '@raycast/api';
import { useState } from "react";
import TurengAPI from "./tureng/TurengAPI";

export default function Command() {
  const [searchText, setSearchText] = useState('');
  const {
    isLoading: isLoading,
    data: suggestions,
  } = useCachedPromise((query) => TurengAPI.instance.complete(query), [searchText], { initialData: [] });

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} throttle={true}>
      {suggestions.map((suggestion) => (
        <List.Item
          key={suggestion}
          title={suggestion}
          actions={
            <ActionPanel>
              <Action.Push title="Translate" target={<TranslationResult word={suggestion} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function TranslationResult(props: { word: string }) {
  const {
    isLoading: isLoading,
    data: results,
  } = usePromise((query) => TurengAPI.instance.lookup(query), [props.word]);
  return (
    <List isLoading={isLoading} navigationTitle={`Translate: ${props.word}`}>
      <List.Section title="TR -> EN">
        {results?.trToEN.map((result) => (
          <List.Item
            key={result.id}
            title={result.term}
            subtitle={result.category}
            accessories={[{ text: result.type }]}
            actions={
              <ActionPanel>
                <Action.Push title='Translate' target={<TranslationResult word={result.term} />} />
                <Action.CopyToClipboard content={result.term} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      <List.Section title="EN -> TR">
        {results?.enToTR.map((result) => (
          <List.Item
            key={result.id}
            title={result.term}
            subtitle={result.category}
            accessories={[{ text: result.type }]}
            actions={
              <ActionPanel>
                <Action.Push title='Translate' target={<TranslationResult word={result.term} />} />
                <Action.CopyToClipboard content={result.term} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

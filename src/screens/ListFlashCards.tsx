import React, { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { View, StyleSheet, TextInput, Image, Alert, Button } from "react-native";
import { debounce } from "lodash";
import FlashCardCell from "../components/FlashCardCell";
import { ScrollView } from "react-native";
import AppLayout from "../components/Layout";
import { ClassroomContext } from "../utils/ClassroomContext";
import * as SecureStore from "expo-secure-store";
import { GRAPHQL_ENDPOINT } from "../utils/endpoint";

//=============================================================================

export default function ListFlashCards(): JSX.Element {
  const [filterText, setFilterText] = useState("");
  const [filterTextDelayed, setFilterTextDelayed] = useState("");
  const [flashCards, setFlashCards] = useState<any>([]);
  const { classroomId } = useContext(ClassroomContext);


  useEffect(() => {
      if (filterTextDelayed === "") {
        setFlashCards(flashCards);
      }
      if (filterTextDelayed !== "") {
        filterFlashCards(flashCards, filterTextDelayed);
      }
  }, [filterTextDelayed]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization" : await SecureStore.getItemAsync("userToken") || ""
      },
      body: JSON.stringify({
        query: `
        query getAllFlashcards ($classroomId: String!){
          getAllFlashcards(classroomId: $classroomId) {
            title,
            tag,
            id,
            subtitle{
              title,
              position,
              paragraph{
                text
              }
            },
            ressource{
              name,
              url
            }
          }
        }
      `,
        variables: {
          classroomId: classroomId,
        },
      }),
    });

    const fetchedData = await response.json();
    setFlashCards(fetchedData.data.getAllFlashcards);
  };

  //============================================================================
  const filterFlashCards = (listFlashCards: any, filterTextDelayed: string) => {
    let listFilteredFlashCards = [];
    for (let i = 0; i < listFlashCards.length; i++) {
      for (let j = 0; j < listFlashCards[i].tag.length; j++) {
        if (listFlashCards[i].tag[j] === filterTextDelayed) {
          listFilteredFlashCards.push(listFlashCards[i]);
        }
      }
    }
    setFlashCards(listFilteredFlashCards);
  };
  //============================================================================

  const debouncedFilter = useCallback(
    debounce((value: string) => setFilterTextDelayed(value), 500),
    []
  );
  const handleFilterTextChange = (value: string) => {
    setFilterText(value);
    debouncedFilter(value);
  };
  //===============================================================================

  const refrech = async () => {
    await getData();
  };
  //===============================================================================

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.cellsContainer}>
        <View style={styles.filterContainer}>
          <TextInput
            onChangeText={(value) => handleFilterTextChange(value)}
            value={filterText}
            placeholder={"Nom de la fiche"}
            textContentType={"emailAddress"}
            style={styles.filterInput}
          />
          <Image source={require("../../assets/filterLoop.png")} />
        </View>

        <View>
          <Button
            title={"Refrech"}
            onPress={() => {
              refrech();
            }}
            color={"#8FC89A"}
          />
        </View>

        {flashCards && flashCards.map((flashCard: any, key: number) => {
          return (
            <FlashCardCell
              key={key}
              flashCardTitle={flashCard.title}
              flashCard_id={flashCard.id}
              flashCardTags={flashCard.tag}
              flashCardRessources={flashCard.ressource}
              subtitles={flashCard.subtitle}
            />
          );
        })}
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  cellsContainer: {
    alignItems: "center",
  },

  filterContainer: {
    flexDirection: "row",

    width: "90%",
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "#787878",
    padding: 5,
    borderRadius: 5,
  },
  filterInput: {
    flex: 1,
  },
});

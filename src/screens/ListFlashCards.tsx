import React, { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { View, StyleSheet, TextInput, Image, Alert, Button } from "react-native";
import { debounce } from "lodash";
import FlashCardCell from "../components/FlashCardCell";
import { ScrollView } from "react-native";
import AppLayout from "../components/Layout";
import { useQuery } from "@apollo/client";
import { GET_ALL_FLASH_CARDS } from "../utils/graphqlRequests";
import { ClassroomContext } from "../utils/ClassroomContext";
import * as SecureStore from "expo-secure-store";

//=============================================================================

export default function ListFlashCards(): JSX.Element {
  const [filterText, setFilterText] = useState("");
  const [filterTextDelayed, setFilterTextDelayed] = useState("");
  const [flashCards, setFlashCards] = useState<any>([]);
  const { classroomId } = useContext(ClassroomContext);
  const { loading, error, data, refetch } = useQuery<
    {
      getAllFlashcards: {
        id: string;
        flashcard: Array<{ id: string; title: string }>;
      };
    },
    { classroomId: string }
  >(GET_ALL_FLASH_CARDS, {
    fetchPolicy :"network-only",
    variables: {
      classroomId: classroomId,
    },
  });

  if(loading && data){
    console.log("loading and adata");
  }

  if(loading && !data){
    console.log("loading and no data");
  }

  if(error){
    console.log(error);
  }



  //MERCI DE GARDER USE MEMO ICI
  //https://github.com/trojanowski/react-apollo-hooks/issues/133
  //https://github.com/trojanowski/react-apollo-hooks/issues/158
/*   useMemo(() => {
    if (data) {
      setFlashCards(data.getAllFlashcards);
    }
  }, [data]); */




  useEffect(() => {
    console.log(data);
  }, [data])


  useEffect(() => {
    if (data) {
      if (filterTextDelayed === "") {
        setFlashCards(data.getAllFlashcards);
      }
      if (filterTextDelayed !== "") {
        filterFlashCards(flashCards, filterTextDelayed);
      }
    }
  }, [filterTextDelayed]);

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
    const userToken = await SecureStore.getItemAsync("userToken");
    console.log("=====");
    console.log(userToken);
    console.log("=====");
    refetch();
    console.log(data);
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
            title={"Get token"}
            onPress={() => {
              refrech();
            }}
            color={"#8FC89A"}
          />
        </View>

        {flashCards.map((flashCard: any, key: number) => {
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

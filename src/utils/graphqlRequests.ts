import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Connection($mail: String!, $password: String!) {
    login(mail: $mail, password: $password) {
      id
      token
      firstname
      lastname
      isTeacher
      mail
      classroom {
        classroomId
        name
        year
      }
    }
  }
`;


export const GET_ALL_FLASH_CARDS = gql`
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
`

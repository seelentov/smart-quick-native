import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';


export const baseData: IStand[] = [
  {
    id: "5ffe7774-1493-4cab-bc98-aa651adee9dd",
    name: "Стенд 1",
    deviceid: 1
  },
  {
    id: "8460efe4-415a-4895-944c-57cd8dd5be19",
    name: "Стенд 2",
    deviceid: 2
  },
  {
    id: "97ed1dd9-fd86-47d1-9362-573adee8d807",
    name: "Стенд 3",
    deviceid: 3
  },
  {
    id: "11de058b-2be0-460c-a196-0a75c4984320",
    name: "Стенд 4",
    deviceid: 4
  },
]


export const DataContext = createContext<DataContextProps>({
  data: [],
  setData: () => { }
});

interface DataContextProps {
  data: IStand[],
  setData: (args0: IStand[]) => void,
}

export const DataProvider = ({ children }: PropsWithChildren) => {

  const [data, setDataState] = useState<IStand[]>([])

  const navigation: NavigationProp<ParamListBase> = useNavigation()

  useEffect(() => {
    const getDataFromLocalStorage = async () => {

      const dataFromLocalStorage = await AsyncStorage.getItem("data");

      if (dataFromLocalStorage && dataFromLocalStorage.length > 0) {
        setDataState(JSON.parse(dataFromLocalStorage))
      } else {
        setDataState(baseData)
      }
    }

    getDataFromLocalStorage()
  }, [])


  const setData = async (data: IStand[]) => {
    setDataState(data)
    await AsyncStorage.setItem("data", JSON.stringify(data));
  }

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
};
import { useCallback, useState } from "react";
import exercises from "./exercises";

export default function useLocalStorageState<T>(key: string, defaultValue: T): [T, (newT: T)=>unknown] {
  const [value,setValue] = useState<T>(()=>{
    const strValue = localStorage.getItem(key)

    if (strValue === null) {
      return defaultValue
    }

    const parsed = JSON.parse(strValue)

    if (!Object.keys(exercises).includes(parsed)) {
      return defaultValue
    }

    return parsed 
  })
  const setLocalStorageState = useCallback((value: T) => {
    localStorage.setItem(key, JSON.stringify(value))
    setValue(value)
  }, [key])

  return [value, setLocalStorageState]
}
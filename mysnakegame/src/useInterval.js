// Reference: https://www.geeksforgeeks.org/reactjs-useinterval-custom-hook/
import { useEffect, useRef } from 'react'; 

// Custom useInterval hook
// Continuously execute callBack function after a given amount of delay
const  useInterval = (callBack, delay) => { 
  // Create a ref to the callBack function  
  const callBackRef = useRef(); 

  useEffect(() => { 
      // Save the latest callBack in the ref 
      callBackRef.current = callBack; 
  }, [callBack]); 

  useEffect(() => { 
      if (delay !== null) { 
          // The setInterval() method executes the callBack function at specified delay interval
          let interval = setInterval(()=> callBackRef.current(), delay); 
          // Return a cleanup function to stop the interval
          return () => clearInterval(interval); 
      } 
  }, [delay]); 
}

export default useInterval;
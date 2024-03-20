export const SignIn = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`https://zno5moaa3b.execute-api.us-west-2.amazonaws.com/dev/api/users/signup`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response);
        if(response.status === 201){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
        
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};

export const LogIn = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`https://zno5moaa3b.execute-api.us-west-2.amazonaws.com/dev/api/users/login`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response,data);
        if(response.status === 200){
            return { res: data, error: null } ;
        }else{
            return { res: null, error: data } ;
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error }
    }
};
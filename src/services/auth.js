const authToken = localStorage.getItem('authToken');

export const SignIn = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/register`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log('response ----',data ,response);
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

export const LogIn = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/login`, requestOptions);
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

export const forgotPassword = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/forgot-password`, requestOptions);
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

export const resetPassword = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/reset-password`, requestOptions);
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

export const getProfile = async (data) => {
    const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${authToken}`,

        },
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/get-my-profile`, requestOptions);;
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

export const updateProfile = async (data) => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization":`Bearer ${authToken}` },
        body: JSON.stringify(data),
    };
    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/update-my-profile`, requestOptions);
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

export const updateProfilePicture = async (formData) => {
    const authToken = localStorage.getItem('authToken');

    const requestOptions = {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: formData,
    };

    try {
        let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/update-my-profile-pic`, requestOptions);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson && (await response.json());
        console.log(response, data);
        if (response.status === 200) {
            return { res: data, error: null };
        } else {
            return { res: null, error: data };
        }
    } catch (error) {
        console.error("There was an error!", error);
        return { res: null, error: error };
    }
};

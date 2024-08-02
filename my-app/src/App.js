import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// ===============================================================================================
// Styled Components
// ===============================================================================================
const MainContainer = styled.div`
    display: flex;
    justify-content: center;
    height: 100vh;
    width: 100%;
`;

const ContentWrapper = styled.div`
    width: 1000px;
    display: flex;
    flex-direction: column;
`;

const NavigationBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
`;

const BrandName = styled.h1`
    font-size: 22px;
    font-weight: bold;
`;

const NavigationLinks = styled.ul`
    display: flex;
    gap: 20px;
`;

const NavigationLink = styled.a`
    color: #333;
    text-decoration: none;
    &:hover {
        color: red;
    }
`;

const TemperatureDisplay = styled.div`
    display: ${({ hidden }) => (hidden ? 'none' : 'block')};
`;

const ItemListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ItemList = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 20px;
    width: 100%;
    max-width: 700px;
`;

const ItemCard = styled.li`
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 30%;
    height: 250px;
    padding: 10px;
    cursor: pointer;
    &:hover {
        background-color: #666;
        color: white;
    }
`;

const FormContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const FormWrapper = styled.div`
    width: 700px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TextInput = styled.input`
    border: 1px solid #ddd;
    padding: 5px;
`;

const TextArea = styled.textarea`
    border: 1px solid #ddd;
    height: 200px;
    padding: 5px;
`;

const ButtonGroup = styled.ul`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

const Button = styled.li`
    cursor: pointer;
    &:hover {
        color: red;
    }
`;

// ===============================================================================================
// NavigationBar Component
// ===============================================================================================
const NavigationBarComponent = ({ onModeChange }) => {
    const [currentTemperature, setCurrentTemperature] = useState(0);

    const constructWeatherUrl = (params) => {
        const { apiKey, format, date, time, x, y } = params;
        return `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=${format}&base_date=${date}&base_time=${time}&nx=${x}&ny=${y}`;
    };

    const retrieveWeatherData = (url) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const items = data.response.body.items.item;
                const temperatureItem = items.find(item => item.category === "T1H");
                if (temperatureItem) setCurrentTemperature(temperatureItem.obsrValue);
            })
            .catch(error => console.error(error));
    };

    const updateWeather = () => {
        const apiKey = "paJ%2BM8y80vWX8Gu5RWTDurJ0y5rQCX4tjEwLh0F%2FwfUABNbw%2BV2iJD%2FBahqq08K%2BvzgPyAU0GFZ84LmVfEDPgA%3D%3D";
        const today = new Date();
        const year = today.getFullYear();
        const month = ("0" + (today.getMonth() + 1)).slice(-2);
        const day = ("0" + today.getDate()).slice(-2);
        const formattedDate = `${year}${month}${day}`;
        const hour = ("0" + today.getHours()).slice(-2);
        const time = `${hour}00`;

        const params = {
            apiKey,
            format: "JSON",
            date: formattedDate,
            time,
            x: 67,
            y: 100
        };

        const url = constructWeatherUrl(params);
        retrieveWeatherData(url);
    };

    useEffect(() => {
        updateWeather();
        const weatherInterval = setInterval(updateWeather, 1000 * 60 * 60);
        return () => clearInterval(weatherInterval);
    }, []);

    return (
        <NavigationBar>
            <BrandName>
                <a href="#">Logo</a>
            </BrandName>
            <TemperatureDisplay hidden={currentTemperature === 0}>
                Current Temperature: {currentTemperature}°C
            </TemperatureDisplay>
            <NavigationLinks>
                <NavigationLink href="#" onClick={() => onModeChange(2)}>Create Post</NavigationLink>
                <NavigationLink href="#">Login</NavigationLink>
                <NavigationLink href="#">Sign Up</NavigationLink>
            </NavigationLinks>
        </NavigationBar>
    );
};

// ===============================================================================================
// ItemCard Component
// ===============================================================================================
const ItemCardComponent = ({ post, onModeChange, onPostClick }) => (
    <ItemCard onClick={() => {
        onModeChange(1);
        onPostClick(post);
    }}>
        <p>{post.title}</p>
    </ItemCard>
);

// ===============================================================================================
// ItemList Component
// ===============================================================================================
const ItemListComponent = ({ onModeChange, currentPage, onPostClick }) => {
    const [items, setItems] = useState([]);

    const fetchItems = () => {
        fetch(`http://localhost:8999/api/test?page=${currentPage}`)
            .then(response => response.json())
            .then(data => setItems(prevItems => [...prevItems, ...data.data.content]));
    };

    useEffect(() => {
        fetchItems();
    }, [currentPage]);

    return (
        <ItemListContainer>
            <ItemList>
                {items.map((item, idx) => (
                    <ItemCardComponent
                        key={idx}
                        post={item}
                        onModeChange={onModeChange}
                        onPostClick={onPostClick}
                    />
                ))}
            </ItemList>
        </ItemListContainer>
    );
};

// ===============================================================================================
// FormComponent (Detail) Component
// ===============================================================================================
const FormComponent = ({ onModeChange, currentPost }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (currentPost) {
            setTitle(currentPost.title);
            setContent(currentPost.content);
        } else {
            setTitle("");
            setContent("");
        }
    }, [currentPost]);

    const handleUpdate = () => {
        fetch("http://localhost:8999/api/test", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: currentPost.id, title, content })
        });
    };

    const handleDelete = () => {
        fetch("http://localhost:8999/api/test", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: currentPost.id })
        }).then(response => {
            if (response.ok) onModeChange(0);
        });
    };

    const handleCreate = () => {
        fetch("http://localhost:8999/api/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        }).then(response => {
            if (response.ok) onModeChange(0);
        });
    };

    return (
        <FormContainer>
            <FormWrapper>
                <div>
                    <span>Title</span>
                    <TextInput
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <span>Content</span>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <ButtonGroup>
                    {currentPost ? (
                        <>
                            <Button onClick={handleUpdate}>Update</Button>
                            <Button onClick={handleDelete}>Delete</Button>
                            <Button onClick={() => onModeChange(0)}>Back to List</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleCreate}>Create</Button>
                            <Button onClick={() => onModeChange(0)}>Cancel</Button>
                        </>
                    )}
                </ButtonGroup>
            </FormWrapper>
        </FormContainer>
    );
};

// ===============================================================================================
// Main Board Component
// ===============================================================================================
const BoardApp = () => {
    const scrollEndRef = useRef(false);
    const [viewMode, setViewMode] = useState(0); // 0 - List, 1 - Detail, 2 - Create
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);

    const handleScroll = () => {
        if (scrollEndRef.current) return;
        const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;
        if (bottom) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <MainContainer>
            <ContentWrapper>
                <NavigationBarComponent onModeChange={setViewMode} />
                {viewMode === 0 && <ItemListComponent onModeChange={setViewMode} currentPage={currentPage} onPostClick={setSelectedPost} />}
                {viewMode === 1 && <FormComponent onModeChange={setViewMode} currentPost={selectedPost} />}
                {viewMode === 2 && <FormComponent onModeChange={setViewMode} currentPost={null} />}
            </ContentWrapper>
        </MainContainer>
    );
};

export default BoardApp;

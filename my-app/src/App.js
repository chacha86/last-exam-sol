import React, {
    useState,
    useEffect,
    useRef
} from 'react';
// import ReactDOM from "https://cdn.skypack.dev/react-dom";
// import reactRouterDom from "https://cdn.skypack.dev/react-router-dom";
// ===============================================================================================
// 현재 날짜와 시간 가져오는 함수. API를 호출할 때 필요
const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const dateStr = year + month + day;

    return dateStr;
};

const getCurrentTime = () => {
    const date = new Date();
    const hours = ("0" + date.getHours()).slice(-2);
    const timeStr = `${hours}00`;

    return timeStr;
};
// ===============================================================================================

// ===============================================================================================
// 네비게이션 바 컴포넌트
// ===============================================================================================
const NavBar = ({ changeMode }) => {
    const [temp, setTemp] = useState(0);

    // 요청 파라미터를 객체로 받아 api url을 완성시켜주는 함수
    const getWeatherUrl = (weatherParam) => {
        return `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${weatherParam.key}&pageNo=1&numOfRows=1000&dataType=${weatherParam.type}&base_date=${weatherParam.date}&base_time=${weatherParam.time}&nx=${weatherParam.nx}&ny=${weatherParam.ny}`;
    };

    // fetch 요청으로 날씨 데이터 받아서 업데이트 해주는 함수
    const fetchWeather = (url) => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                console.log(data.response.body.items.item);
                const itemArr = data.response.body.items.item;
                const result = {};
                itemArr.forEach((item) => {
                    if (item.category === "T1H") {
                        setTemp(item.obsrValue);
                    }
                });
            })
            .catch((err) => console.err(err));
    };

    // 필요한 요청 파라미터를 조립하여 api로 부터 데이터 받아와 업데이트하는 함수
    const getWeather = () => {
        const key =
            "paJ%2BM8y80vWX8Gu5RWTDurJ0y5rQCX4tjEwLh0F%2FwfUABNbw%2BV2iJD%2FBahqq08K%2BvzgPyAU0GFZ84LmVfEDPgA%3D%3D";

        const weatherParam = {
            key: key,
            type: "JSON",
            date: getCurrentDate(),
            time: getCurrentTime(),
            nx: 67, // 대전 둔산동 x 좌표
            ny: 100 // 대전 둔산동 y 좌표
        };

        const url = getWeatherUrl(weatherParam);
        fetchWeather(url);
    };

    // 컴포넌트 마운트시 날짜를 세팅하고 1시간 간격으로 getWeather함수를 실행하게 해줌
    useEffect(() => {
        getWeather();
        const interval = setInterval(() => {
            getWeather();
        }, 1000 * 60 * 60);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="w-[100%] flex sm:flex-row sm:justify-between flex-col items-center p-[10px] border-b">
                <h1 className="font-bold text-[22px]">
                    <a href="#">Logo</a>
                </h1>
                <div className="hidden sm:block">현재기온 : {temp}도</div>
                <div>
                    <ul className="flex gap-5">
                        <li>
                            <a
                                className="hover:text-red-500"
                                href="#"
                                onClick={() => {
                                    changeMode(2);
                                }}
                            >
                                글 작성
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-red-500">
                                Login
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-red-500">
                                Sign Up
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

// ===============================================================================================

// ===============================================================================================
// 게시물 목록에서 하나의 게시물 아이템 컴포넌트
// ===============================================================================================

const PostItem = ({ post, changeMode, clickPost }) => {
    return (
        <li
            className="bg-gray-300 flex justify-center items-center w-[100%] sm:w-[30%] h-[250px] hover:text-white hover:bg-gray-600 hover:cursor-pointer px-[10px]"
            onClick={() => {
                changeMode(1);
                clickPost(post);
            }}
        >
            <p>{post.title}</p>
        </li>
    );
};
// ===============================================================================================

// ===============================================================================================
// 게시물 목록 컴포넌트
// ===============================================================================================
const PostList = ({ changeMode, currentPage, clickPost }) => {
    const [posts, setPosts] = useState([]);
    // const [page, setPage] = useState(1);
    // const changePage = (currentPage) => {
    //     setPage(currentPage);
    // };

    // 기존 데이터에 새로 가져온 데이터를 합쳐서 상태 업데이트. 페이지가 늘어날 수록 게시물을 누적해서 보여주기 위함
    const getPosts = () => {
        fetch(`http://localhost:8999/api/test?page=${currentPage}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setPosts([...posts, ...data.data.content]);
            });
    };

    // 페이지가 바뀌면 서버에서 게시물을 새로 불러온다.
    useEffect(() => {
        getPosts();
    }, [currentPage]);

    return (
        <div className="flex flex-col justify-center items-center">
            <ul className="flex flex-wrap gap-5 w-[300px] sm:w-[700px] p-[20px]">
                {posts.map((item, index) => {
                    return (
                        <PostItem
                            key={index}
                            post={item}
                            changeMode={changeMode}
                            clickPost={clickPost}
                        />
                    );
                })}
            </ul>
            {/*<Pagination page={page} changePage={changePage} />*/}
        </div>
    );
};
// ===============================================================================================

// ===============================================================================================
// 게시물 작성 폼(상세화면) 컴포넌트
// ===============================================================================================
const Detail = ({ changeMode, target }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        setTitle(target == null ? "" : target.title);
        setContent(target == null ? "" : target.content);
    }, [target]);

    const updatePost = () => {
        console.log(target.id);
        console.log(title);
        console.log(content);
        fetch("http://localhost:8999/api/test", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: target.id,
                title: title,
                content: content
            })
        });
    };

    const deletePost = () => {
        fetch("http://localhost:8999/api/test", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: target.id
            })
        }).then((res) => {
            if (res.ok) {
                changeMode(0);
            } else {
                console.log("failed");
            }
        });
    };

    const createPost = () => {
        fetch("http://localhost:8999/api/test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        }).then((res) => {
            if (res.ok) {
                changeMode(0);
            } else {
                console.log("failed");
            }
        });
    };

    return (
        <div className="flex justify-center">
            <div className="w-[700px] flex-col gap-3">
                <div className="flex flex-col">
                    <span>제목</span>
                    <input
                        className="border"
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                    />
                </div>
                <div className="flex flex-col">
                    <span>내용</span>
                    <textarea
                        className="border-2 h-[200px]"
                        onChange={(e) => {
                            setContent(e.target.value);
                        }}
                        value={content}
                    />
                </div>
                <ul className="flex justify-end gap-2">
                    {target != null ? (
                        <block>
                            <li
                                className="hover:text-red-500 hover:cursor-pointer"
                                onClick={updatePost}
                            >
                                수정
                            </li>
                            <li
                                className="hover:text-red-500 hover:cursor-pointer"
                                onClick={deletePost}
                            >
                                삭제
                            </li>
                            <li
                                className="hover:text-red-500 hover:cursor-pointer"
                                onClick={() => {
                                    changeMode(0);
                                }}
                            >
                                목록으로
                            </li>
                        </block>
                    ) : (
                        <block>
                            <li
                                className="hover:text-red-500 hover:cursor-pointer"
                                onClick={createPost}
                            >
                                등록
                            </li>
                            <li
                                className="hover:text-red-500 hover:cursor-pointer"
                                onClick={() => {
                                    changeMode(0);
                                }}
                            >
                                취소
                            </li>
                        </block>
                    )}
                </ul>
            </div>
        </div>
    );
};
// ===============================================================================================

// ===============================================================================================
// 메인 화면 컴포넌트. 여기서 각 컴포넌트들을 조립
// ===============================================================================================
const Board = () => {
    const hasReachedEnd = useRef(false);
    const [mode, setMode] = useState(0); // 0 - list, 1 - update detail, 2 - create detail
    const [page, setPage] = useState(0);
    const [detailTarget, setDetailTarget] = useState(null);

    // 스크롤 페이징을 적용하는 Effect
    useEffect(() => {
        if (mode != 0) {
            return;
        }

        const handleScroll = (event) => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            if (scrollTop + windowHeight >= documentHeight - 10) {
                // 스크롤이 끝에 도달했는지 확인
                if (!hasReachedEnd.current) {
                    hasReachedEnd.current = true;
                    setPage((prevPage) => prevPage + 1);
                }
            } else {
                hasReachedEnd.current = false;
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // 각 화면 전환을 위한 함수
    const changeMode = (targetMode) => {
        if (targetMode == 0) {
            setPage(0);
        }
        setMode(targetMode);
    };

    // 게시물을 선택하면 Detail로 넘겨주기 위한 함수
    const clickPost = (post) => {
        setDetailTarget(post);
    };

    // 각 모드에 따라 화면을 다르게 렌더링하기 위한 함수
    const switchRender = (mode) => {
        switch (mode) {
            case 0:
                return (
                    <PostList
                        changeMode={changeMode}
                        currentPage={page}
                        clickPost={clickPost}
                    />
                );
            case 1:
                return <Detail changeMode={changeMode} target={detailTarget} />;
            case 2:
                return <Detail changeMode={changeMode} target={null} />;
            default:
                return <p>Error</p>;
        }
    };

    return (
        <>
            <div className="flex justify-center">
                <div className="container h-[100%vh] w-[200px] sm:w-[1000px]">
                    <NavBar changeMode={changeMode} />
                    {switchRender(mode)}
                </div>
            </div>
        </>
    );
}

export default Board;

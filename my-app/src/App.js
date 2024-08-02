import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import ReactDOM from 'react-dom';

const NavBar = ({ changeMode }) => {
  const [temp, setTemp] = useState(0);
  // 필요한 요청 파라미터를 조립하여 api로 부터 데이터 받아와 업데이트하는 함수
  const getWeather = () => {
      const key =
          "paJ%2BM8y80vWX8Gu5RWTDurJ0y5rQCX4tjEwLh0F%2FwfUABNbw%2BV2iJD%2FBahqq08K%2BvzgPyAU0GFZ84LmVfEDPgA%3D%3D";

      const dd = new Date();
      const y = dd.getFullYear();
      const m = ("0" + (dd.getMonth() + 1)).slice(-2);
      const d = ("0" + dd.getDate()).slice(-2);
      const ds = y + m + d;

      const dd2 = new Date();
      const h = ("0" + dd2.getHours()).slice(-2);
      const ts = `${h}00`;

      var url =
          "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey= " +
          key +
          "&pageNo=1&numOfRows=1000&dataType=JSON" +
          "&base_date=" +
          ds +
          "&base_time=" +
          ts +
          "&nx=67&ny=100";

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
          .catch((err) => console.log(err));
  };


  return (
      <>
          <div className="w-[100%] flex sm:flex-row sm:justify-between flex-col items-center p-[10px] border-b">
              <h1 className="font-bold text-[22px]">
                  <a href="#">Logo</a>
              </h1>
              <div>현재기온 : {temp}도</div>
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
  useEffect(() => {
      fetch(`http://localhost:8999/api/test?page=${currentPage}`)
          .then((res) => {
              return res.json();
          })
          .then((data) => {
              setPosts([...posts, ...data.data.content]);
          });
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
      </div>
  );
};

const Detail = ({ changeMode, target }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
      setTitle(target == null ? "" : target.title);
      setContent(target == null ? "" : target.content);
  }, [target]);

  const updatePost = () => {
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

const Board = () => {
  const hasReachedEnd = useRef(false);
  const [mode, setMode] = useState(0); // 0 - list, 1 - update detail, 2 - create detail
  const [page, setPage] = useState(0);
  const [detailTarget, setDetailTarget] = useState(null);

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
};
// ===============================================================================================

export default Board;

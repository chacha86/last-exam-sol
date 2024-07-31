package com.example.demo.test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private PostRepository postRepository;

    @GetMapping("/weather")
    public ResultData<Empty> getWeather() {

        return new ResultData<>();
    }
    @GetMapping("/generateData")
    public ResultData<Empty> generateData() {
        for(int i = 0; i < 100; i++) {
            Post post = new Post();
            post.setTitle("title" + i);
            post.setContent("content" + i);
            post.setAuthor("author" + i);
            postRepository.save(post);
        }

        return new ResultData<>();
    }

    @GetMapping("")
    public ResultData getItems(@RequestParam(value = "page", defaultValue = "0") int page) {
        Pageable pageable = Pageable.ofSize(10).withPage(page);
        Page<Post> postList = postRepository.findAllByOrderByCreatedAtDesc(pageable);

        return new ResultData(postList);
    }

    public record PostRequestDto(String title, String content) {}
    @PostMapping
    public ResultData<Empty> createItem(@RequestBody PostRequestDto requestDto) {
        Post post = new Post();

        post.setTitle(requestDto.title);
        post.setContent(requestDto.content);
        post.setCreatedAt(LocalDateTime.now());

        postRepository.save(post);
        return new ResultData();
    }

    public record updateRequestDto(long id, String title, String content) {}
    @PutMapping("")
    public ResultData updateItem(@RequestBody updateRequestDto requestDto) {
        System.out.println(requestDto.id);
        Post post = postRepository.findById(requestDto.id).orElseThrow();
        post.setTitle(requestDto.title);
        post.setContent(requestDto.content);
        postRepository.save(post);

        return new ResultData(post);
    }
    public record DeleteRequestDto(long id) {}
    @DeleteMapping("")
    public ResultData<Empty> deleteItem(@RequestBody DeleteRequestDto requestDto) {
        postRepository.deleteById(requestDto.id);
        return new ResultData();
    }
}

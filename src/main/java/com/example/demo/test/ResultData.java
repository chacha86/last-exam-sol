package com.example.demo.test;

import lombok.Getter;

@Getter
public class ResultData<T> {
    private String msg;
    private T data;

    public ResultData(T data) {
        this.msg = "success";
        this.data = data;
    }

    public ResultData() {
        this((T) new Empty());
    }
}

package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.example.entity")
@EnableJpaRepositories("com.example.repository")
@ComponentScan("com.example")
public class EMartApplication {

	public static void main(String[] args) {
		SpringApplication.run(EMartApplication.class, args);
	}

}
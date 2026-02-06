package com.example.config;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private final Logger log = LoggerFactory.getLogger(this.getClass());

    /**
     * Run before any method in com.example.service package.
     */
    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info(">>> Entering Method: {} with arguments: {}",
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    /**
     * Run after a method in com.example.service package returns successfully.
     */
    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        log.info("<<< Method Executed Successfully: {} | Result: {}",
                joinPoint.getSignature().getName(),
                (result != null ? result.toString() : "void/null"));
    }

    /**
     * Run if any method in com.example.service throws an exception.
     */
    @AfterThrowing(pointcut = "execution(* com.example.service..*.*(..))", throwing = "error")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable error) {
        log.error("!!! Exception in Method: {} | Cause: {}",
                joinPoint.getSignature().getName(),
                error.getMessage());
    }
}

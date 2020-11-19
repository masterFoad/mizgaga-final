package com.mizgaga.demo.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

public class Utils {


    private static void readFromInputStream(InputStream inputStream, StringBuilder sb, int limit) throws IOException {
        int commandRepeatCounter = 0;

        try (BufferedReader reader =
                     new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            while ((line = reader.readLine()) != null) {
                if (limit != -1) {
                    if (commandRepeatCounter == limit) {
                        break;
                    }
                }
                sb.append(line);
                commandRepeatCounter++;
            }
        }
    }

    public static String runFromCommandLine(Consumer<String> onSuccess, Consumer<String> onError, int limit, String... args) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder();
        processBuilder.command(args);

        Process process = processBuilder.start();
        process.waitFor(2, TimeUnit.SECONDS);

        StringBuilder onSuccessResults = new StringBuilder();
        StringBuilder onErrorResults = new StringBuilder();

        readFromInputStream(process.getInputStream(), onSuccessResults, limit);
        if (onSuccessResults.length() > 0) {
            onSuccess.accept(onSuccessResults.toString());
        }

        readFromInputStream(process.getErrorStream(), onErrorResults, limit);
        if (onErrorResults.length() > 0) {
            onError.accept(onErrorResults.toString());
        }

        return onSuccessResults.toString();
    }

    public static void logInfo(String x) {
        System.out.println(x);
    }
}

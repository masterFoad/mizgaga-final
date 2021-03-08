package com.mizgaga.demo.common;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;

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

    public static String webGet(String url) {
        StringBuilder sb = new StringBuilder("");
        int timeout = 500;
        RequestConfig config = RequestConfig.custom()
                .setConnectTimeout(timeout)
                .setConnectionRequestTimeout(timeout)
                .setSocketTimeout(timeout).build();
        try (CloseableHttpClient httpclient = HttpClientBuilder.create().setDefaultRequestConfig(config).build()) {
            HttpGet request = new HttpGet(url);

            CloseableHttpResponse execute = httpclient.execute(request);

            readFromInputStream(execute.getEntity().getContent(), sb, -1);

            sb.append("Success!");
            System.out.println(sb.toString());
        } catch (Exception ignored) {
            sb.append("Failed");
        }

        return sb.toString();
    }

    public static String[] getAllPossibleAddresses(String[] ipParts) {
        String[] allAddresses = new String[255];
        for (int i = 0; i < 255; i++) {
            allAddresses[i] = ipParts[0] + "." + ipParts[1] + "." + ipParts[2] + "." + i;
        }

        return allAddresses;
    }

    public static String convertToCSV(String[] data) {
        return Stream.of(data)
                .map(Utils::escapeSpecialCharacters)
                .collect(Collectors.joining(",")) + "\n";
    }

    public static String escapeSpecialCharacters(String data) {
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }

    public static void writeToCsv(String csvFileName, List<String[]> dataLines) throws IOException {
        csvFileName = String.format(System.getProperty("user.dir") + "/session_output/session_record_%s.csv", csvFileName);
        File csvOutputFile = new File(csvFileName);
        if (csvOutputFile.exists() && !csvOutputFile.isDirectory()) {
            try (PrintWriter pw = new PrintWriter(new FileOutputStream(new File(csvFileName), true))) {
                dataLines.stream()
                        .map(Utils::convertToCSV)
                        .forEach(pw::append);
            }
        } else {
            try (PrintWriter pw = new PrintWriter(csvFileName)) {
                dataLines.stream()
                        .map(Utils::convertToCSV)
                        .forEach(pw::append);
            }
        }
    }
}

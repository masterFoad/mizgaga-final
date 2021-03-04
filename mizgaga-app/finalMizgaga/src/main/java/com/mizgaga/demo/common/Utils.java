package com.mizgaga.demo.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

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
        int limit = Integer.parseInt(ipParts[3]);
        String[] allAddresses = new String[limit];
        for (int i = 0; i < limit; i++) {
            allAddresses[i] = ipParts[0] + "." + ipParts[1] + "." + ipParts[2] + "." + i;
        }

        return allAddresses;
    }
}

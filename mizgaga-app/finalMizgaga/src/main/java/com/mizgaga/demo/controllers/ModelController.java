package com.mizgaga.demo.controllers;

import static com.mizgaga.demo.common.Utils.logInfo;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.mizgaga.demo.common.Utils;
import com.mizgaga.demo.db.SqlManager;
import com.mizgaga.demo.pojos.SessionDataVector;
import com.sun.javafx.PlatformUtil;

@CrossOrigin
@Controller
@RequestMapping("/api/")
@EnableScheduling
public class ModelController {

    private static ConcurrentHashMap<String, SensorStatus> sensorStatus = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String, String> sensorAddress = new ConcurrentHashMap<>();

    @Value("${wifi.name}")
    private String wifiName;

    @Value("${wifi.password}")
    private String wifiPassword;

    @Scheduled(cron = "*/15 * * * * *")
    public void automaticWifiConnector() {
        try {
            Utils.runFromCommandLine((output) -> {
                System.out.println(output);

            }, Utils::logInfo, 8, "node", "./finalMizgaga/src/main/resources/wifi-hunter/cli.js", wifiName, wifiPassword);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }


    /**
     * if mac run this
     */
    Pattern getBroadcastAddress = Pattern.compile("broadcast (\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b)");
    Pattern getSensorIp = Pattern.compile("(\\b\\d{1,3}.\\d{1,3}.\\d{1,3}.\\d{1,3}\\b)..at.3c.71.bf.29.3f.c9");


    /**
     * if windows run this
     */
    //    Pattern getBroadcastAddress = Pattern.compile(" Default Gateway.*(\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b)");
    //    Pattern getSensorIp = Pattern.compile("(\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b)\\s*" + "at.3c.71.bf.29.3f.c9");

    public static String sensorMacAddress = "3c-71-bf-29-3f-c9";

    enum SensorStatus {
        CONNECTED,
        CONNECTING,
        DISCONNECTED
    }

    @Value("${spring.datasource.url}")
    public String mysqlDataSource;

    @Autowired
    ResourceLoader resourceLoader;

    @Autowired
    SqlManager sqlManager;


    private byte[] convertStreamToByteArray(InputStream is) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[1024];
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        buffer.flush();
        return buffer.toByteArray();
    }


    @RequestMapping(value = "/save_session", method = RequestMethod.POST)
    public void saveSessionData(
            @RequestBody List<SessionDataVector> sessionDataVectors,
            HttpServletRequest request,
            HttpServletResponse response) {
        System.out.println("Adding session data - size :" + sessionDataVectors.size());
        int sessionId = ThreadLocalRandom.current().nextInt(10000);
        try (Connection conn = sqlManager.createConnection(mysqlDataSource, "mysql")) {
            try (Statement stm = conn.createStatement()) {
                sessionDataVectors.forEach(sessionDataVector -> {
                    try {
                        String queryToAdd = String
                                .format("insert into session_vectors " +
                                                "value (null, CURRENT_TIMESTAMP(), %s,%s, %s, %s ,%s, %d);"
                                        , sessionDataVector.getTimestamp(), sessionDataVector.getX(), sessionDataVector.getY(), sessionDataVector.getZ(), sessionDataVector.getW(), sessionId);


                        stm.addBatch(queryToAdd);
                    } catch (SQLException throwables) {
                        throwables.printStackTrace();
                    }
                });

                stm.executeLargeBatch();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/handOfTheKing.mtl", method = {RequestMethod.GET})
    @ResponseBody
    public byte[] getHandModelMtl() throws Exception {
        return convertStreamToByteArray(resourceLoader.getResource("classpath:handOfTheKing.mtl").getInputStream());
    }

    @RequestMapping(value = "/handOfTheKing.obj", method = {RequestMethod.GET})
    @ResponseBody
    public byte[] getHandModelObj() throws Exception {
        return convertStreamToByteArray(resourceLoader.getResource("classpath:handOfTheKing.obj").getInputStream());
    }

    @RequestMapping(value = "/incBottle.mtl", method = {RequestMethod.GET})
    @ResponseBody
    public byte[] getBottleMtl() throws Exception {
        return convertStreamToByteArray(resourceLoader.getResource("classpath:incBottle.mtl").getInputStream());
    }

    @RequestMapping(value = "/incBottle.obj", method = {RequestMethod.GET})
    @ResponseBody
    public byte[] getBottleObj() throws Exception {
        return convertStreamToByteArray(resourceLoader.getResource("classpath:incBottle.obj").getInputStream());
    }

    @RequestMapping(value = "/testTex.jpg", method = {RequestMethod.GET})
    @ResponseBody
    public byte[] getTex() throws Exception {
        return convertStreamToByteArray(resourceLoader.getResource("classpath:testTex.jpg").getInputStream());
    }

    @RequestMapping(value = "/face/{faceId}", method = {RequestMethod.GET})
    @ResponseBody
    public void addFace(
            @PathVariable("faceId") int faceId
    ) throws Exception {
        try (Connection conn = sqlManager.createConnection(mysqlDataSource, "mysql")) {
            try (PreparedStatement stm = conn.prepareStatement("insert into faces (face) values (" + faceId + ");", Statement.RETURN_GENERATED_KEYS)) {
                int rs = stm.executeUpdate();
                if (rs > 0) {
                    System.out.println("Success");
                } else {
                    System.out.println("failed");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/face", method = {RequestMethod.GET})
    @ResponseBody
    public int getCurrentFace() throws Exception {
        try (Connection conn = sqlManager.createConnection(mysqlDataSource, "mysql")) {
            try (PreparedStatement stm = conn.prepareStatement("select face from faces ORDER BY id DESC LIMIT 1;", Statement.RETURN_GENERATED_KEYS)) {
                ResultSet rs = stm.executeQuery();
                if (rs.next()) {
                    return rs.getInt(1);
                } else {
                    System.out.println("failed");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return -1;
    }

    @RequestMapping(value = "/get-sensor-address", method = {RequestMethod.GET})
    @ResponseBody
    public String getSensorAddress() {
        return sensorAddress.get(sensorMacAddress);
    }

    @Scheduled(cron = "*/3 * * * * *")
    public void monitorSensorHeartbeat() throws Exception {
        logInfo("Getting current broadcast ip");

        Matcher matcher = getBroadcastIp(getBroadcastAddress);
        if (matcher.find()) {
            pingBroadcast(matcher);
            matcher = runARP(getSensorIp);
            if (matcher.find()) {
                StringBuilder finalCmdOutput = validateDeviceConnection(sensorMacAddress, matcher);
            } else {
                logInfo("Failed to find device[" + sensorMacAddress + "] on network");
                sensorStatus.put(sensorMacAddress, SensorStatus.DISCONNECTED);
                sensorAddress.put(sensorMacAddress, "");
            }
        } else {
            logInfo("Failed to find broadcast ip");
            sensorStatus.put(sensorMacAddress, SensorStatus.DISCONNECTED);
            sensorAddress.put(sensorMacAddress, "");
        }
    }

    @RequestMapping(value = "/get-sensor-heartbeat", method = {RequestMethod.GET})
    @ResponseBody
    public SensorStatus sensorHearbeat() throws Exception {
        return sensorStatus.get(sensorMacAddress);
    }

    private StringBuilder validateDeviceConnection(String sensorMacAddress, Matcher matcher) throws IOException, InterruptedException {
        StringBuilder cmdOutput;
        cmdOutput = new StringBuilder();
        String sensorIp = matcher.group(1).trim();

        logInfo("Found device on network - ip[" + sensorIp + "]");

        StringBuilder finalCmdOutput = cmdOutput;
        Utils.runFromCommandLine((output) -> {
            if (Arrays.stream(output.toLowerCase().split(" ")).filter(string -> string.equals("timeout")).count() < 3) {
                logInfo("Connection Success!");
                finalCmdOutput.append(sensorIp);
            } else {
                logInfo("Failed to confirm possible connection - disconnecting - " + output);
                sensorStatus.put(sensorMacAddress, SensorStatus.DISCONNECTED);
                sensorAddress.put(sensorMacAddress, "");
            }
        }, Utils::logInfo, 8, "ping", sensorIp);

        logInfo(finalCmdOutput.toString());
        sensorStatus.put(sensorMacAddress, SensorStatus.CONNECTED);
        sensorAddress.put(sensorMacAddress, finalCmdOutput.toString());
        return finalCmdOutput;
    }

    private Matcher runARP(Pattern getSensorIp) throws IOException, InterruptedException {
        StringBuilder cmdOutput;
        Matcher matcher;
        cmdOutput = new StringBuilder();
        Utils.runFromCommandLine(cmdOutput::append, Utils::logInfo, -1, "arp", "-a");

        logInfo("Running Address Resolution Protocol");

        matcher = getSensorIp.matcher(cmdOutput);
        return matcher;
    }

    private void pingBroadcast(Matcher matcher) throws IOException, InterruptedException {
        StringBuilder cmdOutput;
        cmdOutput = new StringBuilder(matcher.group(1).trim());

        logInfo("Pinging broadcast - " + cmdOutput);

        Utils.runFromCommandLine(Utils::logInfo, Utils::logInfo, 1, "ping", cmdOutput.toString());
    }

    private Matcher getBroadcastIp(Pattern getBroadcastAddress) throws IOException, InterruptedException {
        StringBuilder cmdOutput = new StringBuilder();
        String cmd = "ifconfig";
        if (PlatformUtil.isWindows()) {
            cmd = "ipconfig";
        }
        Utils.runFromCommandLine(cmdOutput::append, Utils::logInfo, -1, cmd);
        return getBroadcastAddress.matcher(cmdOutput);
    }

}

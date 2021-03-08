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
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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

    private static volatile String lastBroadcastIpAddress = "";
    private static ConcurrentHashMap<String, SensorStatus> sensorStatus = new ConcurrentHashMap<>();
    private static ConcurrentHashMap<String, String> sensorAddress = new ConcurrentHashMap<>();

    @Value("${wifi.name}")
    private String wifiName;

    @Value("${wifi.password}")
    private String wifiPassword;

    @Value("${path.to.wifi.hunter}")
    private String pathToWifiHunter;

    /**
     * if mac/linux run this
     */
    Pattern getBroadcastAddress = Pattern.compile("broadcast (\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b)");
    Pattern getSensorIp = Pattern.compile("(\\b\\d{1,3}.\\d{1,3}.\\d{1,3}.\\d{1,3}\\b)..at.3c.71.bf.29.3f.c9");
    String cmdIp = "ifconfig";

    public ModelController() {
        if (PlatformUtil.isWindows()) {
            this.getBroadcastAddress = Pattern.compile(" Default Gateway.*(\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b)");
            this.getSensorIp = Pattern.compile("(\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b)\\s*" + "at.3c.71.bf.29.3f.c9");
            this.cmdIp = "ipconfig";
        }
    }

    /**
     * if windows run this
     */


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

//    @RequestMapping(value = "/set_configurations", method = RequestMethod.GET)
//    public boolean setDbConfigurations(
//            @RequestParam(name = "db_name", required = false) String dbName,
//            @RequestParam(name = "username", required = false) String username,
//            @RequestParam(name = "password", required = false) String password,
//            HttpServletRequest request,
//            HttpServletResponse response) {
//        String connectionString = String.format("jdbc:mysql://localhost:3306/%s?user=%s&password=%s&useUnicode=true&characterEncoding=UTF-8&useSSL=false&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC&allowPublicKeyRetrieval=true",
//                dbName,
//                username,
//                password);
//        boolean isSuccess = false;
//        try (Connection conn = sqlManager.createConnection(connectionString, "mysql")) {
//            try (Statement stm = conn.createStatement()) {
//                stm.execute("select 1;");
//                this.mysqlDataSource = connectionString;
//                isSuccess = true;
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        return isSuccess;
//    }

    @RequestMapping(value = "/save_session", method = RequestMethod.POST)
    public void saveSessionData(
            @RequestBody List<SessionDataVector> sessionDataVectors,
            HttpServletRequest request,
            HttpServletResponse response) {
        System.out.println("Adding session data - size :" + sessionDataVectors.size());
        int sessionId = ThreadLocalRandom.current().nextInt(10000);


        new Thread(() -> {
            try {
                Utils.writeToCsv(new Timestamp(new Date().getTime()).toString(), sessionDataVectors
                        .stream()
                        .map(vector -> vector.getDataAsStringArray())
                        .collect(Collectors.toList()));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

//        try (Connection conn = sqlManager.createConnection(mysqlDataSource, "mysql")) {
//            try (Statement stm = conn.createStatement()) {
//                sessionDataVectors.forEach(sessionDataVector -> {
//                    try {
//                        String queryToAdd = String
//                                .format("insert into session_vectors " +
//                                                "value (null, CURRENT_TIMESTAMP(), %s,%s, %s, %s ,%s, %d);"
//                                        , sessionDataVector.getTimestamp(), sessionDataVector.getX(), sessionDataVector.getY(), sessionDataVector.getZ(), sessionDataVector.getW(), sessionId);
//
//
//                        stm.addBatch(queryToAdd);
//                    } catch (SQLException throwables) {
//                        throwables.printStackTrace();
//                    }
//                });
//
//                stm.executeLargeBatch();
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
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


    @RequestMapping(value = "/brute-refresh", method = {RequestMethod.GET})
    @ResponseBody
    public void bruteForceRefresh() {
        try {
            bruteForceHuntSensorIp(lastBroadcastIpAddress);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    @RequestMapping(value = "/auto-wifi-connect", method = {RequestMethod.GET})
    @ResponseBody
    public String automaticWifiConnector() {
        List<String> response = new ArrayList<>();
        try {


            Utils.runFromCommandLine((output) -> {
                if (output.contains("network not found")) {
                    response.add("error: network not found [" + wifiName + "]");
                } else {
                    response.add("success");
                }
            }, Utils::logInfo, 8, "node", pathToWifiHunter, wifiName, wifiPassword);

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }

        return response.size() > 0 ? response.get(0) : "error";
    }

    @Scheduled(cron = "*/3 * * * * *")
    public void monitorSensorHeartbeat() throws Exception {
        logInfo("Getting current broadcast ip");

        Matcher matcher = getBroadcastIp(getBroadcastAddress);
        if (matcher.find()) {
            StringBuilder broadcastIp = pingBroadcast(matcher);
            if (!broadcastIp.toString().equals("192.168.4.255") && !lastBroadcastIpAddress.equals(broadcastIp.toString())) {
                lastBroadcastIpAddress = broadcastIp.toString();
            }

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

    private StringBuilder pingBroadcast(Matcher matcher) throws IOException, InterruptedException {
        StringBuilder cmdOutput;
        cmdOutput = new StringBuilder(matcher.group(1).trim());

        logInfo("Pinging broadcast - " + cmdOutput);

        Utils.runFromCommandLine(Utils::logInfo, Utils::logInfo, 1, "ping", cmdOutput.toString());

        return cmdOutput;
    }

    private void bruteForceHuntSensorIp(String broadcastAddress) {
        StringBuilder cmdOutput;
        cmdOutput = new StringBuilder(broadcastAddress);

        String[] ipParts = cmdOutput.toString().trim().split("\\.");

        System.out.println("Brute Forcing network discovery: for Broadcast: " + cmdOutput);
        Arrays.stream(Utils.getAllPossibleAddresses(ipParts))
                .parallel()
                .forEach((ip) -> {
                    String url = "http://" + ip + "/index.html";
                    String out = Utils.webGet(url);
                    if (out.equals("Success!")) {
                        System.out.println("Found Sensor on Network - we are good to go");
                    }
                });
    }

    private Matcher getBroadcastIp(Pattern getBroadcastAddress) throws IOException, InterruptedException {
        StringBuilder cmdOutput = new StringBuilder();
        Utils.runFromCommandLine(cmdOutput::append, Utils::logInfo, -1, this.cmdIp);
        return getBroadcastAddress.matcher(cmdOutput);
    }

}

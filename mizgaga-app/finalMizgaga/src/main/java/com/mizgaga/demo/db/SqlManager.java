//package com.mizgaga.demo.db;
//
//import java.sql.Connection;
//import java.sql.DriverManager;
//
//import org.apache.logging.log4j.LogManager;
//import org.springframework.stereotype.Service;
//
//@Service
//public class SqlManager implements ISqlManager {
//    private static final org.apache.logging.log4j.Logger logger = LogManager.getLogger(SqlManager.class);
//
//    static {
//
//        try {
//
//            Class.forName("com.mysql.jdbc.Driver").newInstance();
//        } catch (Exception e) {
//
//            logger.error(e.getMessage(), e);
//        }
//    }
//
//    public Connection createConnection(String datasource, String alias) throws Exception {
//
//        try {
//            return DriverManager.getConnection(datasource);
//        } catch (Exception e) {
//            logger.error(e.getMessage(), e);
//            throw new Exception("error creating connection: " + alias);
//        }
//    }
//}

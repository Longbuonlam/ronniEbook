package com.ronniebook.web.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.logging.log4j.util.Strings;

public class Utils {

    public static char SEPARATOR = '/';

    public static String getFileExtension(String filePath) {
        int dotIndex = filePath.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filePath.length() - 1) {
            return filePath.substring(dotIndex + 1);
        }
        return null;
    }

    public static String getFolderPath(String filename) {
        if (filename == null) {
            return null;
        }
        int n = filename.lastIndexOf(SEPARATOR);
        if (n != -1) {
            return filename.substring(0, n);
        }
        return null;
    }

    public static <T> List<List<T>> toChunks(List<T> originalList, int chunkSize) {
        List<List<T>> dividedLists = new ArrayList<>();

        int originalSize = originalList.size();
        int numChunks;
        if (originalSize % chunkSize == 0) {
            numChunks = originalSize / chunkSize;
        } else {
            numChunks = originalSize / chunkSize + 1;
        }

        for (int i = 0; i < numChunks; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, originalSize);
            List<T> sublist = originalList.subList(start, end);
            dividedLists.add(sublist);
        }

        return dividedLists;
    }

    public static int roundPercentage(double percentage) {
        int roundedPercentage = (int) percentage;
        if (roundedPercentage != 99 && percentage % 1 != 0) {
            roundedPercentage += 1;
        }
        return roundedPercentage;
    }

    public static String joinPath(String projectId, String fileName) {
        return Strings.join(Arrays.asList(projectId, fileName), SEPARATOR);
    }
}

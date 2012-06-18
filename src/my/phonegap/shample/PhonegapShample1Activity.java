package my.phonegap.shample;

import android.app.Activity;
import org.apache.cordova.*;
import android.os.Bundle;

public class PhonegapShample1Activity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
//        setContentView(R.layout.main);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}
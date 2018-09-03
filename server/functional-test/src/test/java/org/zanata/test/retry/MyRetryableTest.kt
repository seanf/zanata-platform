package org.zanata.test.retry

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

internal class MyRetryableTest {

    // Just to help IntelliJ detect this test class:
    @Test
    @Disabled
    fun dummy() {}

    @DisplayName("Fail all retries")
    @Retry(invocationCount = 5, minSuccess = 3)
    internal fun failAllRetries(retryInfo: RetryInfo) {
        println(retryInfo)
        throw Exception("Failed at $retryInfo")
    }

    @DisplayName("Only fail once")
    @Retry(invocationCount = 5, minSuccess = 4)
    internal fun succeedOnRetry(retryInfo: RetryInfo) {
        if (retryInfo.invocation == 1) {
            throw Exception("Failed at ${retryInfo.invocation}")
        }
    }

    @DisplayName("Only requires single success and is first execution")
    @Retry(invocationCount = 5, minSuccess = 1)
    internal fun firstSuccess(retryInfo: RetryInfo) {
        println("Running: $retryInfo")
    }

    @DisplayName("Only requires single success and is last execution")
    @Retry(invocationCount = 5, minSuccess = 1)
    internal fun lastSuccess(retryInfo: RetryInfo) {
        if (retryInfo.invocation < 5) {
            throw Exception("Failed at ${retryInfo.invocation}")
        }
    }

    @DisplayName("All required all succeed")
    @Retry(invocationCount = 5, minSuccess = 5)
    internal fun allRequiredAllSucceed(retryInfo: RetryInfo) {
        println("Running: $retryInfo")
    }

    @DisplayName("Fail early and disable")
    @Retry(invocationCount = 5, minSuccess = 4)
    internal fun failEarly(retryInfo: RetryInfo) {
        throw Exception("Failed at ${retryInfo.invocation}")
    }
}

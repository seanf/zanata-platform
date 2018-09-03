package org.zanata.test.retry

import java.lang.Exception

internal class RetryingTestFailure(invocation: Int, cause: Throwable) : Exception("Failed test execution at invocation #$invocation", cause)

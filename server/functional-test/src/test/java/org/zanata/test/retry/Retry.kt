package org.zanata.test.retry

import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith

// RetryTestExtension is by mkobit. https://stackoverflow.com/a/46207476/14379

@TestTemplate
@Target(AnnotationTarget.FUNCTION)
@ExtendWith(RetryTestExtension::class)
annotation class Retry(val invocationCount: Int, val minSuccess: Int)
